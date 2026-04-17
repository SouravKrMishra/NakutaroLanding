import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import EventsSection from "@/components/EventsSection.tsx";
import FAQSection from "@/components/FAQSection.tsx";
import CTASection from "@/components/CTASection.tsx";
import axios from "axios";
import { buildApiUrl } from "@/lib/api.ts";
import { Calendar, Star, Play, Pause, Volume2, VolumeX } from "lucide-react";
import ncrWinner from "@assets/ncrwinner.jpg";
import iitDelhi from "@assets/iit-delhi.jpg";
import pennywise from "@assets/Pennywise.jpg";

type HeroMediaItem = {
  id?: string;
  url: string;
  filename?: string;
  autoScrollDelay?: number;
};

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v", ".ogg"];

const isVideoMedia = (url?: string) => {
  if (!url) return false;
  const normalizedUrl = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => normalizedUrl.endsWith(ext));
};

const getSafeDelay = (delay?: number) => {
  if (typeof delay !== "number" || Number.isNaN(delay)) return 5000;
  return Math.max(1000, delay);
};

function MediaThumb({
  item,
  className,
}: {
  item: HeroMediaItem;
  className?: string;
}) {
  if (isVideoMedia(item.url)) {
    return (
      <video
        src={`${item.url}#t=0.5`}
        className={className}
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  return <img src={item.url} alt="" className={className} />;
}

const EventsPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const [activeSlide, setActiveSlide] = useState(0);
  const [eventMedia, setEventMedia] = useState<HeroMediaItem[]>([]);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  useEffect(() => {
    const fetchEventImages = async () => {
      try {
        const response = await axios.get(
          buildApiUrl("/api/settings/events/images"),
        );
        if (response.data.success && response.data.images) {
          const media = response.data.images.filter(
            (item: HeroMediaItem) => item.url,
          );
          setEventMedia(media);
          setAutoScrollEnabled(
            response.data.autoScrollEnabled !== undefined
              ? response.data.autoScrollEnabled
              : true,
          );
          setActiveSlide((prev) => {
            if (media.length === 0) return 0;
            return prev >= media.length ? 0 : prev;
          });
        }
      } catch (error) {
        console.error("Failed to fetch event images:", error);
        setEventMedia([]);
        setActiveSlide(0);
      }
    };
    fetchEventImages();
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const scrollCooldown = useRef(false);
  useEffect(() => {
    const mediaCount = eventMedia.length;
    if (mediaCount <= 1) return;
    const el = heroRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const threshold = 30;
      if (Math.abs(e.deltaY) < threshold) return;

      e.preventDefault();

      if (scrollCooldown.current) return;
      scrollCooldown.current = true;

      if (e.deltaY > 0) {
        setActiveSlide((prev) => (prev + 1) % mediaCount);
      } else {
        setActiveSlide((prev) => (prev - 1 + mediaCount) % mediaCount);
      }
      setTimeout(() => {
        scrollCooldown.current = false;
      }, 700);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [eventMedia]);

  useEffect(() => {
    if (!autoScrollEnabled || eventMedia.length <= 1) return;

    const delay = getSafeDelay(eventMedia[activeSlide]?.autoScrollDelay);
    const timeoutId = window.setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % eventMedia.length);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeSlide, eventMedia, autoScrollEnabled]);

  const springTransition = {
    type: "spring" as const,
    stiffness: 260,
    damping: 28,
    mass: 0.9,
  };

  const timelineEvents = [
    {
      year: "2024",
      title: "Nakutaro Cosplay Royale",
      description:
        "Self-organized cosplay event with a ₹50,000 prize pool, bringing together passionate cosplayers and anime fans.",
      date: "September 28, 2024",
      highlight: "500+ attendees",
      image: ncrWinner,
    },
    {
      year: "2024",
      title: "Masquerade Cosplay Event at IIT Delhi",
      description:
        "Associate sponsorship during IIT Delhi Rendezvous with a revamped ₹30,000 prize pool for participants.",
      date: "October 5-8, 2024",
      highlight: "5000+ attendees",
      image: iitDelhi,
    },
    {
      year: "2024",
      title: "Khooni Monday Horrorcon",
      description:
        "Sponsored horror convention cosplay competition with a ₹60,000 prize pool and strong fan participation.",
      date: "October 26, 2024",
      highlight: "3000+ attendees",
      image: pennywise,
    },
  ];

  const prevIdx =
    eventMedia.length > 0
      ? (activeSlide - 1 + eventMedia.length) % eventMedia.length
      : 0;
  const nextIdx =
    eventMedia.length > 0 ? (activeSlide + 1) % eventMedia.length : 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  const setVideoRef = useCallback(
    (idx: number) => (el: HTMLVideoElement | null) => {
      if (el) videoRefs.current.set(idx, el);
      else videoRefs.current.delete(idx);
    },
    [],
  );

  const togglePlay = useCallback(() => {
    const vid = videoRefs.current.get(activeSlide);
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, [activeSlide]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      videoRefs.current.forEach((vid) => {
        vid.muted = next;
      });
      return next;
    });
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (idx === activeSlide) return;
      vid.pause();
      vid.currentTime = 0;
    });
    setIsPlaying(false);
  }, [activeSlide]);

  return (
    <div className="events-page pt-24 pb-16 overflow-hidden">
      {/* Hero Section — stacked card deck */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 md:mb-20">
        <div ref={heroRef} className="relative max-w-7xl mx-auto">
          {eventMedia.length > 0 ? (
            <div className="relative" style={{ perspective: "1200px" }}>
              {/* Back layer 2 (deeper) — peeks out wider like a book page */}
              {eventMedia.length > 2 && (
                <motion.div
                  key="back-layer-2"
                  animate={{ scaleY: 0.97, opacity: 0.32 }}
                  transition={springTransition}
                  className="hidden sm:block absolute aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg z-0"
                  style={{
                    transformStyle: "preserve-3d",
                    top: "1.5%",
                    left: "-2.8%",
                    right: "-2.8%",
                  }}
                >
                  <div className="absolute inset-0 bg-black/60 z-10" />
                </motion.div>
              )}

              {/* Back layer 1 (just behind main) — peeks out like a book page */}
              {eventMedia.length > 1 && (
                <motion.div
                  key="back-layer-1"
                  animate={{ scaleY: 0.99, opacity: 0.52 }}
                  transition={springTransition}
                  className="hidden sm:block absolute aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg z-[1]"
                  style={{
                    transformStyle: "preserve-3d",
                    top: "0.8%",
                    left: "-1.8%",
                    right: "-1.8%",
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={`back1-inner-${nextIdx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <MediaThumb
                        item={eventMedia[nextIdx]}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-black/40 z-10" />
                </motion.div>
              )}

              {/* Front card (active) — main focus */}
              <motion.div
                key="center-card"
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={springTransition}
                className="relative w-full z-10"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                  {/* All media rendered once, only active one visible */}
                  {eventMedia.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="absolute inset-0 transition-all duration-500"
                      style={{
                        opacity: idx === activeSlide ? 1 : 0,
                        scale: idx === activeSlide ? "1" : "1.04",
                        filter: idx === activeSlide ? "blur(0px)" : "blur(6px)",
                        zIndex: idx === activeSlide ? 2 : 1,
                        pointerEvents: idx === activeSlide ? "auto" : "none",
                        transitionTimingFunction:
                          "cubic-bezier(0.33, 1, 0.68, 1)",
                      }}
                    >
                      {isVideoMedia(item.url) ? (
                        <video
                          ref={setVideoRef(idx)}
                          src={item.url}
                          className="w-full h-full object-cover cursor-pointer"
                          muted={isMuted}
                          loop
                          playsInline
                          preload={idx <= 2 ? "auto" : "metadata"}
                          onClick={togglePlay}
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={`Event carousel media ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}

                  {/* Video controls overlay */}
                  {isVideoMedia(eventMedia[activeSlide]?.url) && (
                    <>
                      <div
                        className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 cursor-pointer ${
                          isPlaying
                            ? "opacity-0 hover:opacity-100"
                            : "opacity-100"
                        }`}
                        onClick={togglePlay}
                      >
                        <div className="bg-black/50 backdrop-blur-sm rounded-full w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center">
                          {isPlaying ? (
                            <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                          ) : (
                            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white ml-0.5" />
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                        className="absolute bottom-3 right-3 z-30 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white transition-all cursor-pointer"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[320px] sm:h-[400px] rounded-3xl bg-[#1A1A1A] border border-[#333]">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border border-[#333]" />
            </div>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <motion.span
            variants={fadeIn("up", "tween", 0.1, 1)}
            className="text-accent font-semibold text-sm uppercase tracking-wider"
          >
            Our Journey
          </motion.span>
          <motion.h2
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Event Timeline
          </motion.h2>
          <motion.p
            variants={fadeIn("up", "tween", 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            See how Anime India's events have evolved over the years
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {timelineEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative z-10 bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#333] shadow-xl group"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full font-bold shadow-lg">
                  {event.year}
                </div>
              </div>

              <div className="p-6 relative">
                <div className="absolute -top-4 left-6 bg-[#222] px-4 py-1 rounded-full text-sm font-medium text-gray-300 border border-[#333]">
                  {event.date}
                </div>
                <h3 className="text-xl font-bold mb-3 mt-3">{event.title}</h3>
                <p className="text-gray-400 mb-4">{event.description}</p>
                <div className="flex items-center mt-auto">
                  <div className="flex items-center text-accent/80 bg-accent/5 px-3 py-1 rounded-full text-sm">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{event.highlight}</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/events/all"
            className="inline-flex items-center justify-center rounded-lg border border-accent/40 bg-[#181818] px-8 py-3 text-lg font-bold text-white transition-colors duration-200 hover:bg-accent/10 hover:border-accent/60"
          >
            <Calendar className="h-5 w-5 mr-2 text-accent" />
            View All Events
          </a>
        </div>
      </div>

      <EventsSection hideViewAllCta />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default EventsPage;
