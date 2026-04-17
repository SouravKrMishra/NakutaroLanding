import { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Camera,
  Users,
  Medal,
} from "lucide-react";
import { GalleryPopup } from "./ui/gallery-popup.tsx";
import { EventPopup } from "./ui/event-popup.tsx";
import axios from "axios";
import { buildApiUrl } from "@/lib/api.ts";

interface ApiEvent {
  _id: string;
  title: string;
  category: "organized" | "sponsored" | "upcoming";
  eventDate: string;
  eventEndDate?: string;
  time: string;
  location: string;
  description: string;
  image: string;
  featuredImage?: string;
  featured: boolean;
  tags: string[];
  prizePool: string;
  attendees: string;
  galleryImages: { src: string; alt: string }[];
  isActive: boolean;
  order: number;
}

interface DisplayEvent {
  title: string;
  date: string;
  location: string;
  time: string;
  description: string;
  image: string;
  featured?: boolean;
  prizePool?: string;
  attendees?: string;
  featured_image?: string;
  category?: string;
  galleryImages?: { src: string; alt: string }[];
}

// Static gallery imports (bundled assets for the Nakutaro Cosplay Royale gallery)
import cosplay1 from "@assets/Newfolder/cosplay-royale (1)1.JPG";
import cosplay2 from "@assets/Newfolder/cosplay-royale (2)2.JPG";
import cosplay3 from "@assets/Newfolder/cosplay-royale (3)3.JPG";
import cosplay4 from "@assets/Newfolder/cosplay-royale (4)4.JPG";
import cosplay5 from "@assets/Newfolder/cosplay-royale (5)5.JPG";
import cosplay6 from "@assets/Newfolder/cosplay-royale (6)6.JPG";
import cosplay7 from "@assets/Newfolder/cosplay-royale (7)7.JPG";
import cosplay8 from "@assets/Newfolder/cosplay-royale (8)8.JPG";
import cosplay9 from "@assets/Newfolder/cosplay-royale (9)9.JPG";
import cosplay10 from "@assets/Newfolder/cosplay-royale (10)10.JPG";
import cosplay11 from "@assets/Newfolder/cosplay-royale (11)11.JPG";
import cosplay12 from "@assets/Newfolder/cosplay-royale (12)12.JPG";
import cosplay13 from "@assets/Newfolder/cosplay-royale (13)13.JPG";
import cosplay14 from "@assets/Newfolder/cosplay-royale (14)14.JPG";
import cosplay15 from "@assets/Newfolder/cosplay-royale (15)15.JPG";
import cosplay16 from "@assets/Newfolder/cosplay-royale (16)16.JPG";
import cosplay17 from "@assets/Newfolder/cosplay-royale (17)17.JPG";
import cosplay18 from "@assets/Newfolder/cosplay-royale (18)18.JPG";
import cosplay19 from "@assets/Newfolder/cosplay-royale (19)19.JPG";
import cosplay20 from "@assets/Newfolder/cosplay-royale (20)20.JPG";
import cosplay21 from "@assets/Newfolder/cosplay-royale (21)21.JPG";
import cosplay22 from "@assets/Newfolder/cosplay-royale (22)22.JPG";
import cosplay23 from "@assets/Newfolder/cosplay-royale (23)23.JPG";
import cosplay24 from "@assets/Newfolder/cosplay-royale (24)24.JPG";
import cosplay25 from "@assets/Newfolder/cosplay-royale (25)25.JPG";
import cosplay26 from "@assets/Newfolder/cosplay-royale (26)26.JPG";
import cosplay27 from "@assets/Newfolder/cosplay-royale (27)27.JPG";
import cosplay28 from "@assets/Newfolder/cosplay-royale (28)28.JPG";
import cosplay29 from "@assets/Newfolder/cosplay-royale (29)29.JPG";
import cosplay30 from "@assets/Newfolder/cosplay-royale (30)30.JPG";

const createGalleryImages = () => {
  const images = [
    cosplay1,
    cosplay2,
    cosplay3,
    cosplay4,
    cosplay5,
    cosplay6,
    cosplay7,
    cosplay8,
    cosplay9,
    cosplay10,
    cosplay11,
    cosplay12,
    cosplay13,
    cosplay14,
    cosplay15,
    cosplay16,
    cosplay17,
    cosplay18,
    cosplay19,
    cosplay20,
    cosplay21,
    cosplay22,
    cosplay23,
    cosplay24,
    cosplay25,
    cosplay26,
    cosplay27,
    cosplay28,
    cosplay29,
    cosplay30,
  ];
  const config = [
    { alt: "Anime cosplay event 1", width: 1200, height: 800 },
    { alt: "Anime cosplay event 2", width: 800, height: 1200 },
    { alt: "Anime cosplay event 3", width: 1200, height: 800 },
    { alt: "Anime cosplay event 4", width: 800, height: 800 },
    { alt: "Anime cosplay event 5", width: 800, height: 600 },
    { alt: "Anime cosplay event 6", width: 800, height: 1000 },
    { alt: "Anime cosplay event 7", width: 800, height: 1200 },
    { alt: "Anime cosplay event 8", width: 1000, height: 1500 },
    { alt: "Anime cosplay event 9", width: 800, height: 600 },
    { alt: "Anime cosplay event 10", width: 1200, height: 900 },
    { alt: "Anime cosplay event 11", width: 800, height: 1100 },
    { alt: "Anime cosplay event 12", width: 1000, height: 800 },
    { alt: "Anime cosplay event 13", width: 1200, height: 800 },
    { alt: "Anime cosplay event 14", width: 800, height: 1100 },
    { alt: "Anime cosplay event 15", width: 900, height: 700 },
    { alt: "Anime cosplay event 16", width: 1000, height: 800 },
    { alt: "Anime cosplay event 17", width: 1000, height: 800 },
    { alt: "Anime cosplay event 18", width: 1000, height: 800 },
    { alt: "Anime cosplay event 19", width: 1000, height: 800 },
    { alt: "Anime cosplay event 20", width: 1000, height: 800 },
    { alt: "Anime cosplay event 21", width: 1000, height: 800 },
    { alt: "Anime cosplay event 22", width: 1000, height: 800 },
    { alt: "Anime cosplay event 23", width: 1000, height: 800 },
    { alt: "Anime cosplay event 24", width: 1000, height: 800 },
    { alt: "Anime cosplay event 25", width: 1000, height: 800 },
    { alt: "Anime cosplay event 26", width: 1000, height: 800 },
    { alt: "Anime cosplay event 27", width: 1000, height: 800 },
    { alt: "Anime cosplay event 28", width: 1000, height: 800 },
    { alt: "Anime cosplay event 29", width: 1000, height: 800 },
    { alt: "Anime cosplay event 30", width: 1000, height: 800 },
  ];
  return images.map((src, i) => ({ src, ...config[i] }));
};

function formatEventDate(iso: string, endIso?: string): string {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  if (endIso) {
    const e = new Date(endIso);
    if (d.getMonth() === e.getMonth() && d.getFullYear() === e.getFullYear()) {
      return `${d.toLocaleDateString("en-IN", { month: "long" })} ${d.getDate()}-${e.getDate()}, ${d.getFullYear()}`;
    }
    return `${d.toLocaleDateString("en-IN", opts)} – ${e.toLocaleDateString("en-IN", opts)}`;
  }
  return d.toLocaleDateString("en-IN", opts);
}

function apiToDisplay(ev: ApiEvent): DisplayEvent {
  return {
    title: ev.title,
    date: formatEventDate(ev.eventDate, ev.eventEndDate),
    location: ev.location,
    time: ev.time,
    description: ev.description,
    image: ev.image,
    featured: ev.featured,
    prizePool: ev.prizePool,
    attendees: ev.attendees,
    featured_image: ev.featuredImage || ev.image,
    category: ev.category,
    galleryImages: ev.galleryImages,
  };
}

interface EventsSectionProps {
  hideViewAllCta?: boolean;
}

const EventsSection = memo(({ hideViewAllCta = false }: EventsSectionProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DisplayEvent | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[] | null>(null);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const [activeMobileSlide, setActiveMobileSlide] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(buildApiUrl("/api/event-timeline"));
        if (res.data.success && res.data.events) {
          setEvents(res.data.events);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, []);

  const organizedEvents = events.filter(
    (e) => e.category === "organized" || e.featured,
  );
  const featuredEventSource = [...organizedEvents].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.order !== b.order) return a.order - b.order;
    return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
  })[0];
  const featuredEvent = featuredEventSource ? apiToDisplay(featuredEventSource) : null;

  const otherEvents = events
    .filter((e) => !(e.category === "organized" || e.featured))
    .map(apiToDisplay);

  useEffect(() => {
    setActiveMobileSlide((prev) =>
      Math.min(prev, Math.max(otherEvents.length - 1, 0)),
    );
  }, [otherEvents.length]);

  const openGallery = useCallback((ev?: DisplayEvent) => {
    if (ev?.galleryImages && ev.galleryImages.length > 0) {
      setGalleryImages(
        ev.galleryImages.map((g, i) => ({
          src: g.src,
          alt: g.alt || `Gallery image ${i + 1}`,
          width: 1000,
          height: 800,
        })),
      );
      setGalleryTitle(`${ev.title} Gallery`);
    } else {
      setGalleryImages(createGalleryImages());
      setGalleryTitle("Nakutaro Cosplay Royale Gallery");
    }
    setGalleryOpen(true);
  }, []);

  const handleMobileCarouselScroll = useCallback(() => {
    const container = mobileCarouselRef.current;
    if (!container) return;

    const cardWidth = container.clientWidth * 0.86;
    if (cardWidth <= 0) return;

    const slide = Math.round(container.scrollLeft / cardWidth);
    const clamped = Math.max(0, Math.min(slide, otherEvents.length - 1));
    setActiveMobileSlide(clamped);
  }, [otherEvents.length]);

  if (events.length === 0) {
    return null;
  }

  const categoryLabel: Record<string, string> = {
    organized: "Organized",
    sponsored: "Sponsored",
    upcoming: "Upcoming",
  };

  return (
    <section id="events" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#171717] overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.05; transform: scale(1); }
            50% { opacity: 0.1; transform: scale(1.2); }
          }
        `}</style>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-block bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20 mb-6">
            <span className="text-accent font-medium text-sm flex items-center justify-center">
              <Calendar className="h-4 w-4 mr-2" />
              EVENTS & COLLABORATIONS
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6">
            <span className="text-white">Immersive Anime</span>{" "}
            <span className="text-accent">Events</span>
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Connect with fellow anime and cosplay enthusiasts at our exciting
            events across India
          </p>
        </div>

        <div>
          {/* Featured Event */}
          {featuredEvent && (
            <div className="mb-16">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-r from-accent/30 to-transparent h-[1px] flex-grow mr-4"></div>
                <h3 className="text-2xl font-bold text-white">
                  Our{" "}
                  <span className="text-accent">
                    {categoryLabel[featuredEvent.category || "organized"] ||
                      "Featured"}{" "}
                    Event
                  </span>
                </h3>
                <div className="bg-gradient-to-l from-accent/30 to-transparent h-[1px] flex-grow ml-4"></div>
              </div>

              <div className="relative rounded-2xl overflow-hidden group shadow-lg bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] border border-[#333] hover:border-accent/30 transition-colors duration-200">
                <div className="absolute -inset-px bg-accent/5 rounded-2xl"></div>
                <div className="relative h-[480px] sm:h-[450px] md:h-[480px] lg:h-[530px] overflow-hidden">
                  {featuredEvent.image ? (
                    <img
                      src={featuredEvent.featured_image || featuredEvent.image}
                      alt={featuredEvent.title}
                      loading="eager"
                      decoding="async"
                      className="absolute w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                      style={{ willChange: "transform" }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#222]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/30 to-transparent pointer-events-none"></div>

                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex gap-2">
                    <div className="bg-accent/95 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg flex items-center">
                      <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      {categoryLabel[featuredEvent.category || "organized"]}
                    </div>
                  </div>

                  {featuredEvent.prizePool && (
                    <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-accent/90 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                      {featuredEvent.prizePool}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 text-white">
                          {featuredEvent.title}
                        </h4>
                        <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 mb-3 sm:mb-6">
                          <div className="flex items-center text-gray-300">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-accent" />
                            <span className="text-sm sm:text-base">
                              {featuredEvent.date}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-accent" />
                            <span className="text-sm sm:text-base">
                              {featuredEvent.location}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-accent" />
                            <span className="text-sm sm:text-base">
                              {featuredEvent.time}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-x-3 sm:gap-x-6 gap-y-2 sm:gap-y-3 mb-3 sm:mb-6">
                          {featuredEvent.prizePool && (
                            <div className="flex items-center bg-accent/15 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-sm sm:text-base">
                              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-accent mr-1.5 sm:mr-2" />
                              <span className="text-white">
                                {featuredEvent.prizePool}
                              </span>
                            </div>
                          )}
                          {featuredEvent.attendees && (
                            <div className="flex items-center bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-sm sm:text-base">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-accent mr-1.5 sm:mr-2" />
                              <span className="text-white">
                                {featuredEvent.attendees}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 max-w-3xl mb-4 sm:mb-8 text-sm sm:text-base">
                          {featuredEvent.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 sm:mt-4 lg:mt-0">
                        <button
                          onClick={() => openGallery(featuredEvent)}
                          className="inline-flex items-center rounded-lg border border-accent/40 bg-[#181818] px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white transition-all duration-200 ease-out hover:bg-accent/10 hover:border-accent/60 active:scale-[0.98]"
                          style={{ willChange: "transform" }}
                        >
                          <Camera className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-white" />
                          View Gallery
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Events (Sponsored / Upcoming) */}
          {otherEvents.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-r from-accent/30 to-transparent h-[1px] flex-grow mr-4"></div>
                <h3 className="text-2xl font-bold text-white">
                  Our <span className="text-accent">Sponsored Events</span>
                </h3>
                <div className="bg-gradient-to-l from-accent/30 to-transparent h-[1px] flex-grow ml-4"></div>
              </div>

              <div
                ref={mobileCarouselRef}
                onScroll={handleMobileCarouselScroll}
                className="md:hidden -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {otherEvents.map((event, index) => (
                  <div
                    key={index}
                    className="w-[86%] shrink-0 snap-center bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] rounded-xl overflow-hidden border border-[#333] group hover:border-accent/30 transition-colors duration-200 shadow-lg"
                  >
                    <div className="h-56 relative overflow-hidden">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          loading="lazy"
                          decoding="async"
                          className="absolute w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                          style={{ willChange: "transform" }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#222]" />
                      )}
                      <div className="absolute inset-0"></div>

                      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                        <div className="flex items-center">
                          <Medal className="h-3 w-3 text-accent mr-1" />
                          <span>
                            {categoryLabel[event.category || "sponsored"]}
                          </span>
                        </div>
                      </div>

                      {event.prizePool && (
                        <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                          {event.prizePool}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h4 className="text-xl font-bold mb-3">{event.title}</h4>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center text-gray-400 text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-accent/70" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock className="h-4 w-4 mr-2 text-accent/70" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm col-span-2">
                          <MapPin className="h-4 w-4 mr-2 text-accent/70" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-6 line-clamp-3 text-sm">
                        {event.description}
                      </p>
                      {event.attendees && (
                        <div className="text-sm text-gray-400 flex items-center">
                          <Users className="h-4 w-4 mr-1 text-accent/70" />
                          {event.attendees} Attendees
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="md:hidden mt-4 flex items-center justify-center gap-2">
                {otherEvents.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to event slide ${index + 1}`}
                    onClick={() => {
                      const container = mobileCarouselRef.current;
                      if (!container) return;
                      container.scrollTo({
                        left: container.clientWidth * 0.86 * index,
                        behavior: "smooth",
                      });
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      activeMobileSlide === index
                        ? "w-6 bg-accent"
                        : "w-2 bg-white/30"
                    }`}
                  />
                ))}
              </div>

              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-8">
                {otherEvents.map((event, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] rounded-xl overflow-hidden border border-[#333] group hover:border-accent/30 transition-colors duration-200 shadow-lg"
                  >
                    <div className="h-56 relative overflow-hidden">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          loading="lazy"
                          decoding="async"
                          className="absolute w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                          style={{ willChange: "transform" }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#222]" />
                      )}
                      <div className="absolute inset-0"></div>

                      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                        <div className="flex items-center">
                          <Medal className="h-3 w-3 text-accent mr-1" />
                          <span>
                            {categoryLabel[event.category || "sponsored"]}
                          </span>
                        </div>
                      </div>

                      {event.prizePool && (
                        <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                          {event.prizePool}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h4 className="text-xl font-bold mb-3">{event.title}</h4>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center text-gray-400 text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-accent/70" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock className="h-4 w-4 mr-2 text-accent/70" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm col-span-2">
                          <MapPin className="h-4 w-4 mr-2 text-accent/70" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-6 line-clamp-3 text-sm">
                        {event.description}
                      </p>
                      {event.attendees && (
                        <div className="text-sm text-gray-400 flex items-center">
                          <Users className="h-4 w-4 mr-1 text-accent/70" />
                          {event.attendees} Attendees
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hideViewAllCta && (
            <div className="mt-12 text-center">
              <a
                href="/events/all"
                className="inline-flex items-center justify-center rounded-lg border border-accent/40 bg-[#181818] px-8 py-3 text-lg font-bold text-white transition-colors duration-200 hover:bg-accent/10 hover:border-accent/60"
              >
                <Calendar className="h-5 w-5 mr-2 text-accent" />
                View All Events
              </a>
            </div>
          )}
        </div>
      </div>

      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-accent rounded-full opacity-[0.02] filter blur-[100px]"
        style={{ willChange: "auto" }}
      ></div>

      {galleryOpen && galleryImages && galleryImages.length > 0 && (
        <GalleryPopup
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          images={galleryImages}
          title={galleryTitle}
        />
      )}

      {selectedEvent && (
        <EventPopup
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
        />
      )}
    </section>
  );
});

EventsSection.displayName = "EventsSection";

export default EventsSection;
