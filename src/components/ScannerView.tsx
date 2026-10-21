import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, RefreshCw, Zap, ZapOff, Pause, Play, AlertCircle } from 'lucide-react';

interface ScannerViewProps {
  onScan: (decodedText: string, formatName: string) => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onScan,
  isPaused,
  onTogglePause,
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'interactive-barcode-reader';
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'running' | 'error' | 'permission_denied'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [torchAvailable, setTorchAvailable] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
  }, []);

  const startScanner = useCallback(async (cameraIdOrFacing?: string | { facingMode: string }) => {
    try {
      setCameraState('starting');
      setErrorMessage('');

      await stopScanner();

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
            Html5QrcodeSupportedFormats.CODABAR,
          ],
          verbose: false,
        });
      }

      // Query available video devices
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          if (!selectedCameraId && devices.length > 0) {
            // Prefer back/environment camera
            const backCam = devices.find(d => 
              d.label.toLowerCase().includes('back') || 
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
            );
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          }
        }
      } catch (e) {
        console.debug('Failed to list cameras:', e);
      }

      // Helper to try starting with config
      const tryStart = async (config: unknown) => {
        if (!scannerRef.current) return false;
        await scannerRef.current.start(
          config as string,
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              return { 
                width: Math.max(Math.floor(minEdge * 0.85), 220), 
                height: Math.max(Math.floor(minEdge * 0.55), 140) 
              };
            },
            aspectRatio: 1.333333,
          },
          (decodedText, decodedResult) => {
            const formatName = decodedResult?.result?.format?.formatName || 'BARCODE';
            onScan(decodedText, formatName);
          },
          () => {}
        );
        return true;
      };

      let started = false;
      let lastErr: unknown = null;

      // 1. Try specified ID or selected ID
      if (cameraIdOrFacing) {
        try {
          await tryStart(cameraIdOrFacing);
          started = true;
        } catch (e) {
          lastErr = e;
        }
      } else if (selectedCameraId) {
        try {
          await tryStart(selectedCameraId);
          started = true;
        } catch (e) {
          lastErr = e;
        }
      }

      // 2. Try environment camera
      if (!started) {
        try {
          await tryStart({ facingMode: 'environment' });
          started = true;
        } catch (e) {
          lastErr = e;
        }
      }

      // 3. Try front/user camera or webcam
      if (!started) {
        try {
          await tryStart({ facingMode: 'user' });
          started = true;
        } catch (e) {
          lastErr = e;
        }
      }

      // 4. Try generic stream
      if (!started) {
        try {
          await tryStart(true);
          started = true;
        } catch (e) {
          lastErr = e;
        }
      }

      if (!started) {
        throw lastErr || new Error('No camera hardware found on this device.');
      }

      setCameraState('running');

      // Check if torch / flash is supported
      try {
        const stream = (document.getElementById(containerId)?.querySelector('video') as HTMLVideoElement)?.srcObject as MediaStream;
        if (stream) {
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities ? (track.getCapabilities() as unknown as { torch?: boolean }) : null;
          if (capabilities && 'torch' in capabilities) {
            setTorchAvailable(true);
          } else {
            setTorchAvailable(false);
          }
        }
      } catch {
        setTorchAvailable(false);
      }

    } catch (err: unknown) {
      console.error('Scanner start error:', err);
      const str = String(err);
      if (str.includes('NotAllowedError') || str.includes('Permission denied')) {
        setCameraState('permission_denied');
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser address bar.');
      } else if (str.includes('NotFoundError') || str.includes('Requested device not found') || str.includes('DevicesNotFoundError')) {
        setCameraState('error');
        setErrorMessage('No camera hardware was detected on this device. You can enter serial numbers manually or use image upload.');
      } else {
        setCameraState('error');
        setErrorMessage(str || 'Could not access device camera.');
      }
    }
  }, [stopScanner, selectedCameraId, onScan]);

  // Handle pause / resume
  useEffect(() => {
    if (scannerRef.current && cameraState === 'running') {
      try {
        if (isPaused) {
          scannerRef.current.pause(true);
        } else {
          scannerRef.current.resume();
        }
      } catch (e) {
        console.debug('Error toggling pause state:', e);
      }
    }
  }, [isPaused, cameraState]);

  // Start on mount
  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const toggleTorch = async () => {
    try {
      const stream = (document.getElementById(containerId)?.querySelector('video') as HTMLVideoElement)?.srcObject as MediaStream;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        const nextState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as unknown as MediaTrackConstraintSet]
        });
        setTorchOn(nextState);
      }
    } catch (err) {
      console.warn('Torch toggle error:', err);
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    startScanner(newId);
  };

  return (
    <div className="relative rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Video Viewport */}
      <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
        <div id={containerId} className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

        {/* Starting / Permission overlay */}
        {cameraState === 'starting' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white">Opening rear camera...</div>
            <div className="text-xs text-slate-400 max-w-xs">Initializing hardware video stream with barcode decoders.</div>
          </div>
        )}

        {/* Permission Denied / Error Overlay */}
        {(cameraState === 'error' || cameraState === 'permission_denied') && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-white">
              {cameraState === 'permission_denied' ? 'Camera Permission Required' : 'Camera Unavailable'}
            </div>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {errorMessage || 'Please ensure camera access is granted in your mobile browser settings.'}
            </p>
            <button
              onClick={() => startScanner()}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
            >
              Retry Camera Access
            </button>
          </div>
        )}

        {/* Target Reticle with Animated Laser Line when scanning */}
        {cameraState === 'running' && !isPaused && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="relative w-[80%] h-[60%] border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.35)]">
              {/* Corner Reticles */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

              {/* Scanning Red/Emerald Laser Line */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[scanBeam_2s_ease-in-out_infinite_alternate]" />
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {cameraState === 'running' && isPaused && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Scanner Paused (Scan Detected)
            </div>
          </div>
        )}
      </div>

      {/* Camera Toolbar Bar */}
      <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              cameraState === 'running'
                ? isPaused
                  ? 'bg-amber-400'
                  : 'bg-emerald-400 animate-pulse'
                : 'bg-slate-500'
            }`}
          />
          <span className="font-medium text-slate-300">
            {cameraState === 'running'
              ? isPaused
                ? 'Paused'
                : 'Scanning'
              : cameraState === 'starting'
              ? 'Starting...'
              : 'Inactive'}
          </span>
        </div>

        {/* Camera Switching (if multi-camera device) */}
        {cameras.length > 1 && (
          <div className="flex items-center gap-1.5 max-w-[130px]">
            <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCameraId}
              onChange={handleCameraChange}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] rounded-lg px-2 py-1 truncate focus:outline-none focus:border-emerald-500"
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label || `Camera ${c.id.slice(0, 4)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center space-x-1.5">
          {torchAvailable && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-xl transition ${
                torchOn
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Flashlight"
            >
              {torchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={onTogglePause}
            disabled={cameraState !== 'running'}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition"
            title={isPaused ? 'Resume Scanning' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={() => startScanner()}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Reload Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
