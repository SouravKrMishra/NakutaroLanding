import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { Camera, RefreshCcw, Image as ImageIcon, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const accessories = [
  {
    id: 1,
    name: 'Naruto Headband',
    image: 'https://images.unsplash.com/photo-1598336489935-7e176a84a211?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
    arPosition: { x: 0, y: -0.2, scale: 1.2 },
  },
  {
    id: 2,
    name: 'Cat Ears',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
    arPosition: { x: 0, y: -0.3, scale: 1 },
  },
  {
    id: 3,
    name: 'Dragon Ball Scouter',
    image: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
    arPosition: { x: 0.12, y: -0.05, scale: 0.8 },
  },
  {
    id: 4,
    name: 'One Piece Hat',
    image: 'https://images.unsplash.com/photo-1515938560431-9d39a09162a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
    arPosition: { x: 0, y: -0.25, scale: 1.1 },
  },
];

const ARTryOn = () => {
  const [selectedAccessory, setSelectedAccessory] = useState<number | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accessoryRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (cameraActive) {
        stopCamera();
      }
    };
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please make sure you have given permission to use the camera.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Draw accessory if one is selected
        if (selectedAccessory !== null && accessoryRef.current) {
          const accessory = accessories.find(a => a.id === selectedAccessory);
          
          if (accessory) {
            // Calculate accessory position based on face detection
            // This is a simplified version, real face detection would require more complex code
            const centerX = canvas.width / 2 + (accessory.arPosition.x * canvas.width);
            const centerY = canvas.height / 3 + (accessory.arPosition.y * canvas.height); // Assuming face is in upper third
            const accessoryWidth = canvas.width * 0.5 * accessory.arPosition.scale;
            
            // Draw accessory image at calculated position
            context.drawImage(
              accessoryRef.current,
              centerX - (accessoryWidth / 2),
              centerY - (accessoryWidth / 2),
              accessoryWidth,
              accessoryWidth * (accessoryRef.current.height / accessoryRef.current.width)
            );
          }
        }
        
        // Convert canvas to image
        const imageDataUrl = canvas.toDataURL('image/png');
        setImageSrc(imageDataUrl);
        setIsCapturing(false);
        stopCamera();
      }
    }
  };

  const restartAR = () => {
    setImageSrc(null);
    startCamera();
  };

  const downloadImage = () => {
    if (imageSrc) {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = `anime-india-cosplay-${Date.now()}.png`;
      link.click();
    }
  };

  const shareImage = async () => {
    if (imageSrc && navigator.share) {
      try {
        // Convert base64 to blob
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const file = new File([blob], 'anime-india-cosplay.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My Anime India Cosplay',
          text: 'Check out my cosplay accessory from Anime India!',
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        alert('Could not share the image. Try downloading it instead.');
      }
    } else {
      alert('Sharing is not supported on this browser. Try downloading the image instead.');
    }
  };

  const selectImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target?.result) {
            setImageSrc(event.target.result as string);
          }
        };
        
        reader.readAsDataURL(target.files[0]);
      }
    };
    
    input.click();
  };

  return (
    <section id="ar-try-on" className="py-20 bg-[#121212] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            variants={fadeIn('up', 'tween', 0.1, 1)}
            className="text-center mb-12"
          >
            <div className="inline-block bg-accent/10 px-3 py-1 rounded-sm border-l-2 border-accent mb-2">
              <span className="text-accent font-bold text-sm uppercase tracking-widest">
                NEW FEATURE
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              AR Cosplay Try-On
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Try on our popular cosplay accessories virtually before you buy! 
              Use your camera or upload a photo to see how you'll look.
            </p>
          </motion.div>

          <motion.div
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
          >
            {/* AR Preview Area */}
            <div className="bg-[#1E1E1E] rounded-xl p-4 h-full">
              <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden mb-4">
                {!cameraActive && !imageSrc && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <Camera className="h-12 w-12 text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">
                      Start the camera or upload a photo to try on cosplay accessories
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button 
                        onClick={startCamera}
                        className="bg-accent hover:bg-accent/90"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera
                      </Button>
                      <Button 
                        onClick={selectImage}
                        variant="outline"
                        className="border-accent/20 hover:bg-accent/10"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                    </div>
                  </div>
                )}
                
                {cameraActive && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {selectedAccessory !== null && (
                      <div className="absolute top-0 left-0 w-full h-full">
                        {/* This is where the AR overlay would go in a real implementation */}
                        {/* We're using a simple overlay for demo purposes */}
                      </div>
                    )}
                    <Button
                      onClick={captureImage}
                      disabled={isCapturing}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-accent hover:bg-accent/90 rounded-full w-14 h-14 flex items-center justify-center"
                    >
                      {isCapturing ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6" />
                      )}
                    </Button>
                  </>
                )}
                
                {imageSrc && (
                  <>
                    <img 
                      src={imageSrc} 
                      alt="Captured" 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      <Button
                        onClick={restartAR}
                        size="sm"
                        className="bg-accent hover:bg-accent/90"
                      >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                      <Button
                        onClick={downloadImage}
                        size="sm"
                        className="bg-accent hover:bg-accent/90"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={shareImage}
                        size="sm"
                        className="bg-accent hover:bg-accent/90"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </>
                )}
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Hidden image element for loading accessory images */}
              {selectedAccessory !== null && (
                <img
                  ref={accessoryRef}
                  src={accessories.find(a => a.id === selectedAccessory)?.image}
                  alt="Accessory"
                  className="hidden"
                />
              )}
            </div>
            
            {/* Accessory Selection */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Choose an Accessory</h3>
              <div className="grid grid-cols-2 gap-4">
                {accessories.map((accessory) => (
                  <button
                    key={accessory.id}
                    onClick={() => setSelectedAccessory(accessory.id)}
                    className={`
                      relative bg-[#2D2D2D] rounded-lg p-2 h-full transition-all 
                      ${selectedAccessory === accessory.id ? 'ring-2 ring-accent' : 'hover:bg-[#333333]'}
                    `}
                  >
                    <div className="aspect-square rounded-md overflow-hidden mb-2">
                      <img
                        src={accessory.image}
                        alt={accessory.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm font-medium">{accessory.name}</p>
                    {selectedAccessory === accessory.id && (
                      <div className="absolute top-2 right-2 h-4 w-4 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-[#222222] rounded-lg">
                <h3 className="text-lg font-semibold mb-2">How It Works</h3>
                <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                  <li>Start your camera or upload a photo</li>
                  <li>Select a cosplay accessory from the options</li>
                  <li>Position yourself to match the accessory</li>
                  <li>Take a photo to save your look</li>
                  <li>Download or share with friends!</li>
                </ol>
                <p className="text-xs text-gray-500 mt-4">
                  Note: For the best experience, make sure you're in a well-lit environment and your face is clearly visible.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Background effects */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-accent opacity-5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/3 left-0 w-40 h-40 bg-accent opacity-5 rounded-full filter blur-3xl"></div>
    </section>
  );
};

export default ARTryOn;