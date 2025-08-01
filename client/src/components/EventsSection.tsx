import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Camera,
  Users,
  Medal,
} from "lucide-react";
import { GalleryPopup } from "./ui/gallery-popup";
import { EventPopup } from "./ui/event-popup";

interface Event {
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
}

// Import all gallery images
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

// Import event images
import ncrWinner from "@assets/ncrwinner.jpg";
import iitDelhi from "@assets/iit-delhi.jpg";
import pennywise from "@assets/Pennywise.jpg";

const EventsSection = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const organizedEvent: Event = {
    title: "Nakutaro Cosplay Royale",
    date: "September 28, 2024",
    location: "NCUI Auditorium, Hauz Khas, New Delhi",
    time: "10:00 AM - 6:00 PM",
    description:
      "Self-organized premier cosplay event featuring a prize pool of ₹50,000, attracting numerous cosplay enthusiasts to showcase their talents.",
    image: ncrWinner,
    featured_image: ncrWinner,
    featured: true,
    prizePool: "₹50,000",
    attendees: "500+",
  };

  const sponsoredEvents: Event[] = [
    {
      title: "Masquerade Cosplay Event at IIT Delhi",
      date: "October 5-8, 2024",
      location: "IIT Delhi Campus",
      time: "All Day",
      description:
        "Nakutaro served as an associate sponsor for the Masquerade Cosplay Event during IIT Delhi's annual cultural fest, Rendezvous. The event offered a revamped prize pool of ₹30,000, contributed by Nakutaro, encouraging participants to display their creativity.",
      image: iitDelhi,
      prizePool: "₹30,000",
      attendees: "500+",
    },
    {
      title: "Khooni Monday Horrorcon",
      date: "October 26, 2024",
      location: "Siri Fort Auditorium, New Delhi",
      time: "11:00 AM - 9:00 PM",
      description:
        "Nakutaro partnered as a sponsor for this horror-themed convention featuring a cosplay competition with a prize pool of ₹60,000, providing a platform for fans to immerse themselves in the genre.",
      image: pennywise,
      prizePool: "₹60,000",
      attendees: "600+",
    },
  ];

  // Gallery images with different widths/heights for masonry layout
  const galleryImages = [
    {
      src: cosplay1,
      alt: "Anime cosplay event 1",
      width: 1200,
      height: 800,
    },
    {
      src: cosplay2,
      alt: "Anime cosplay event 2",
      width: 800,
      height: 1200,
    },
    {
      src: cosplay3,
      alt: "Anime cosplay event 3",
      width: 1200,
      height: 800,
    },
    {
      src: cosplay4,
      alt: "Anime cosplay event 4",
      width: 800,
      height: 800,
    },
    {
      src: cosplay5,
      alt: "Anime cosplay event 5",
      width: 800,
      height: 600,
    },
    {
      src: cosplay6,
      alt: "Anime cosplay event 6",
      width: 800,
      height: 1000,
    },
    {
      src: cosplay7,
      alt: "Anime cosplay event 7",
      width: 800,
      height: 1200,
    },
    {
      src: cosplay8,
      alt: "Anime cosplay event 8",
      width: 1000,
      height: 1500,
    },
    {
      src: cosplay9,
      alt: "Anime cosplay event 9",
      width: 800,
      height: 600,
    },
    {
      src: cosplay10,
      alt: "Anime cosplay event 10",
      width: 1200,
      height: 900,
    },
    {
      src: cosplay11,
      alt: "Anime cosplay event 11",
      width: 800,
      height: 1100,
    },
    {
      src: cosplay12,
      alt: "Anime cosplay event 12",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay13,
      alt: "Anime cosplay event 13",
      width: 1200,
      height: 800,
    },
    {
      src: cosplay14,
      alt: "Anime cosplay event 14",
      width: 800,
      height: 1100,
    },
    {
      src: cosplay15,
      alt: "Anime cosplay event 15",
      width: 900,
      height: 700,
    },
    {
      src: cosplay16,
      alt: "Anime cosplay event 16",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay17,
      alt: "Anime cosplay event 17",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay18,
      alt: "Anime cosplay event 18",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay19,
      alt: "Anime cosplay event 19",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay20,
      alt: "Anime cosplay event 20",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay21,
      alt: "Anime cosplay event 21",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay22,
      alt: "Anime cosplay event 22",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay23,
      alt: "Anime cosplay event 23",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay24,
      alt: "Anime cosplay event 24",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay25,
      alt: "Anime cosplay event 25",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay26,
      alt: "Anime cosplay event 26",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay27,
      alt: "Anime cosplay event 27",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay28,
      alt: "Anime cosplay event 28",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay29,
      alt: "Anime cosplay event 29",
      width: 1000,
      height: 800,
    },
    {
      src: cosplay30,
      alt: "Anime cosplay event 30",
      width: 1000,
      height: 800,
    },
  ];

  const openGallery = (e: React.MouseEvent) => {
    e.preventDefault();
    setGalleryOpen(true);
  };

  return (
    <section id="events" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[#171717] overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>

        {/* Decorative elements */}
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 bg-accent rounded-full filter blur-[120px] opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-40 right-10 w-60 h-60 bg-accent rounded-full filter blur-[100px] opacity-5"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="inline-block bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20 mb-6"
          >
            <span className="text-accent font-medium text-sm flex items-center justify-center">
              <Calendar className="h-4 w-4 mr-2" />
              EVENTS & COLLABORATIONS
            </span>
          </motion.div>

          <motion.h2
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="text-3xl md:text-5xl font-bold mt-2 mb-6"
          >
            <span className="text-white">Immersive Anime</span>{" "}
            <span className="text-accent">Events</span>
          </motion.h2>

          <motion.p
            variants={fadeIn("up", "tween", 0.3, 1)}
            className="text-gray-300 text-lg leading-relaxed"
          >
            Connect with fellow anime and cosplay enthusiasts at our exciting
            events across India
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {/* Featured Event */}
          <motion.div
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="mb-16"
          >
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-accent/30 to-transparent h-[1px] flex-grow mr-4"></div>
              <h3 className="text-2xl font-bold text-white">
                Our <span className="text-accent">Organized Event</span>
              </h3>
              <div className="bg-gradient-to-l from-accent/30 to-transparent h-[1px] flex-grow ml-4"></div>
            </div>

            <div className="relative rounded-2xl overflow-hidden group shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] border-2 border-[#333] hover:border-accent/50 transition-all duration-500">
              {/* Highlight glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-accent/30 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="absolute -inset-px bg-accent/5 rounded-2xl"></div>

              <div className="relative h-[480px] sm:h-[450px] md:h-[480px] lg:h-[530px] overflow-hidden">
                <img
                  src={organizedEvent.featured_image || organizedEvent.image}
                  alt={organizedEvent.title}
                  loading="eager"
                  decoding="async"
                  className="absolute w-full h-full object-cover transform transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent"></div>

                {/* Event badge */}
                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-accent backdrop-blur-sm text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-xl flex items-center animate-pulse">
                  <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  FEATURED EVENT
                </div>

                {/* Main content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12">
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 text-white group-hover:text-accent transition-colors duration-300">
                        {organizedEvent.title}
                      </h4>

                      <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 mb-3 sm:mb-6">
                        <div className="flex items-center text-gray-300">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-accent" />
                          <span className="text-sm sm:text-base">
                            {organizedEvent.date}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-accent" />
                          <span className="text-sm sm:text-base">
                            {organizedEvent.location}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-accent" />
                          <span className="text-sm sm:text-base">
                            {organizedEvent.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-3 sm:gap-x-6 gap-y-2 sm:gap-y-3 mb-3 sm:mb-6">
                        <div className="flex items-center bg-accent/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-sm sm:text-base">
                          <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-accent mr-1.5 sm:mr-2" />
                          <span className="text-white">
                            {organizedEvent.prizePool}
                          </span>
                        </div>
                        <div className="flex items-center bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-sm sm:text-base">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-accent mr-1.5 sm:mr-2" />
                          <span className="text-white">
                            {organizedEvent.attendees}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-300 max-w-3xl mb-4 sm:mb-8 text-sm sm:text-base">
                        {organizedEvent.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 sm:mt-4 lg:mt-0">
                      <button
                        onClick={openGallery}
                        className="group relative inline-flex items-center overflow-hidden rounded-lg border border-accent/40 bg-[#181818] px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white transition-all duration-300 ease-out hover:scale-105"
                      >
                        <span className="absolute inset-0 translate-y-32 transition-transform duration-300 ease-out group-hover:translate-y-0">
                          <span className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent to-transparent"></span>
                        </span>
                        <span className="relative flex items-center">
                          <Camera className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-white" />
                          View Gallery
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sponsored Events */}
          <motion.div variants={fadeIn("up", "tween", 0.3, 1)} className="mb-8">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-accent/30 to-transparent h-[1px] flex-grow mr-4"></div>
              <h3 className="text-2xl font-bold text-white">
                Our <span className="text-accent">Sponsored Events</span>
              </h3>
              <div className="bg-gradient-to-l from-accent/30 to-transparent h-[1px] flex-grow ml-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sponsoredEvents.map((event, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn("up", "tween", 0.1 + index * 0.1, 1)}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] rounded-xl overflow-hidden border border-[#333] group hover:border-accent/30 transition-all duration-300 shadow-lg"
                >
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="absolute w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 "></div>

                    {/* Event badge */}
                    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                      <div className="flex items-center">
                        <Medal className="h-3 w-3 text-accent mr-1" />
                        <span>Sponsored</span>
                      </div>
                    </div>

                    {/* Prize indicator */}
                    <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                      {event.prizePool}
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors duration-300">
                      {event.title}
                    </h4>

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
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming events CTA */}
          <motion.div
            variants={fadeIn("up", "tween", 0.4, 1)}
            className="mt-12 text-center"
          >
            <a
              href="/events"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-accent/40 bg-[#181818] px-8 py-3 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105"
            >
              <span className="absolute inset-0 translate-y-32 transition-transform duration-300 ease-out group-hover:translate-y-0">
                <span className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent to-transparent"></span>
              </span>
              <span className="relative flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-accent" />
                View All Events
              </span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated elements */}
      <div
        className="absolute top-1/4 left-8 w-2 h-2 bg-accent rounded-full animate-ping"
        style={{ animationDuration: "2s" }}
      ></div>
      <div
        className="absolute bottom-1/4 right-8 w-2 h-2 bg-accent rounded-full animate-ping"
        style={{ animationDuration: "3s", animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute top-3/4 left-1/3 w-2 h-2 bg-white rounded-full animate-ping"
        style={{ animationDuration: "4s", animationDelay: "1s" }}
      ></div>

      {/* Accent glows */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-accent rounded-full opacity-[0.02] filter blur-[100px]"></div>

      {/* Popups */}
      <GalleryPopup
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={galleryImages}
        title="Nakutaro Cosplay Royale Gallery"
      />

      {selectedEvent && (
        <EventPopup
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
        />
      )}
    </section>
  );
};

export default EventsSection;
