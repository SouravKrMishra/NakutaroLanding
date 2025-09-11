import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import { useToast } from "@/hooks/use-toast.ts";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Message sent successfully!",
      description: "We'll get back to you as soon as possible.",
    });

    form.reset();
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Our Location",
      content: (
        <>
          215, Rajpur khurd ext.
          <br />
          DLF Farms Chattarpur, New Delhi – 110068
        </>
      ),
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email Us",
      content: (
        <a
          href="mailto:support@animeindia.org"
          className="text-gray-400 hover:text-[#ff382e] transition duration-300"
        >
          support@animeindia.org
        </a>
      ),
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Call Us",
      content: (
        <a
          href="tel:+911149042581"
          className="text-gray-400 hover:text-[#ff382e] transition duration-300"
        >
          (+91) 11 4904 2581
        </a>
      ),
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Working Hours",
      content: (
        <>
          Monday - Friday: 10AM - 6PM
          <br />
          Sunday: By Appointment Only
        </>
      ),
    },
  ];

  const socialLinks = [
    { icon: <Instagram className="h-5 w-5" />, href: "#" },
    { icon: <Facebook className="h-5 w-5" />, href: "#" },
    { icon: <Twitter className="h-5 w-5" />, href: "#" },
    {
      icon: <Mail className="h-5 w-5" />,
      href: "mailto:support@animeindia.org",
    },
  ];

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
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
          <motion.span
            variants={fadeIn("up", "tween", 0.1, 1)}
            className="text-accent font-semibold text-sm uppercase tracking-wider"
          >
            Contact Us
          </motion.span>
          <motion.h2
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Get in Touch
          </motion.h2>
          <motion.p
            variants={fadeIn("up", "tween", 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Have a question or ready to start your project? Contact us today.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            variants={fadeIn("right", "tween", 0.2, 1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <Form {...form}>
              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-accent/30 rounded-tl-lg pointer-events-none"></div>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-accent/30 rounded-br-lg pointer-events-none"></div>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6 relative bg-[#121212]/50 backdrop-blur-sm p-6 rounded-lg border border-[#333333]/50 shadow-xl"
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <span>Send Us a Message</span>
                    <motion.span
                      className="ml-3 inline-block w-2 h-2 bg-accent rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    ></motion.span>
                  </h3>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 flex items-center">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="mr-1"
                          >
                            Full Name
                          </motion.span>
                          <motion.span
                            className="text-accent"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            *
                          </motion.span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your Name"
                            {...field}
                            className="w-full bg-[#2D2D2D] border border-[#333333] focus:border-accent rounded-md px-4 py-3 text-white focus:outline-none transition-all duration-300 hover:shadow-md"
                          />
                        </FormControl>
                        <FormMessage className="text-accent" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 flex items-center">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="mr-1"
                          >
                            Email Address
                          </motion.span>
                          <motion.span
                            className="text-accent"
                            animate={{ y: [0, -3, 0] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: 0.2,
                            }}
                          >
                            *
                          </motion.span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your@email.com"
                            type="email"
                            {...field}
                            className="w-full bg-[#2D2D2D] border border-[#333333] focus:border-accent rounded-md px-4 py-3 text-white focus:outline-none transition-all duration-300 hover:shadow-md"
                          />
                        </FormControl>
                        <FormMessage className="text-accent" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 flex items-center">
                          <motion.span whileHover={{ scale: 1.05 }}>
                            Subject
                          </motion.span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="How can we help?"
                              {...field}
                              className="w-full bg-[#2D2D2D] border border-[#333333] focus:border-accent rounded-md px-4 py-3 text-white focus:outline-none transition-all duration-300 hover:shadow-md"
                            />
                            <motion.div
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs"
                              animate={{ opacity: field.value ? 0 : 1 }}
                            >
                              Optional
                            </motion.div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-accent" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 flex items-center">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="mr-1"
                          >
                            Message
                          </motion.span>
                          <motion.span
                            className="text-accent"
                            animate={{ y: [0, -3, 0] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: 0.4,
                            }}
                          >
                            *
                          </motion.span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your project or inquiry..."
                            rows={5}
                            {...field}
                            className="w-full bg-[#2D2D2D] border border-[#333333] focus:border-accent rounded-md px-4 py-3 text-white focus:outline-none resize-none transition-all duration-300 hover:shadow-md"
                          />
                        </FormControl>
                        <FormMessage className="text-accent" />
                        <motion.div
                          className="text-right text-xs text-gray-500 mt-1"
                          animate={{
                            opacity: field.value?.length ? 1 : 0,
                          }}
                        >
                          {field.value?.length || 0}/500 characters
                        </motion.div>
                      </FormItem>
                    )}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-accent hover:bg-accent/80 text-white font-medium py-3 px-6 rounded-md transition duration-300 shadow-lg relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            Send Message
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </>
                        )}
                      </span>
                      <span className="absolute w-0 h-full bg-accent/20 top-0 left-0 transition-all duration-300 group-hover:w-full"></span>
                    </Button>
                  </motion.div>
                </form>
              </div>
            </Form>
          </motion.div>

          <motion.div
            variants={fadeIn("left", "tween", 0.4, 1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="bg-[#121212] p-8 rounded-xl border border-[#2D2D2D] h-full">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <span>Contact Information</span>
                <span className="inline-block ml-4 relative">
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-ping opacity-75"></span>
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full"></span>
                </span>
              </h3>

              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <motion.div
                        className="flex items-center justify-center h-10 w-10 rounded-md bg-[#2D2D2D] text-accent"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {item.icon}
                      </motion.div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium mb-1 flex items-center">
                        <span>{item.title}</span>
                        {item.title === "Our Location" && (
                          <span className="inline-block w-2 h-2 bg-accent rounded-full ml-2"></span>
                        )}
                      </h4>
                      <p className="text-gray-400">{item.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Interactive Map */}
              <motion.div
                className="mt-8 rounded-lg overflow-hidden border border-[#333] relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative w-full h-80 bg-[#121212]">
                  {/* Real Google Map Integration */}
                  <iframe
                    src="https://www.google.com/maps?q=Anime+India,+Gr.+Fl.,+129,+Rajpur+Khurd+Extension,+Chhatarpur,+New+Delhi,+Delhi+110068&z=16&output=embed"
                    width="100%"
                    height="325"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Anime India Headquarters - Gr. Fl., 129, Rajpur Khurd Extension, Chhatarpur, New Delhi"
                    className="filter brightness-[0.85] contrast-[1.1]"
                  ></iframe>

                  {/* Overlay for branding */}
                  <div className="absolute bottom-3 right-12 bg-[#121212]/90 px-3 py-2 rounded-md text-xs text-gray-300 border border-accent/20 shadow-md backdrop-blur-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-accent mr-1" />
                      <span>Anime India HQ</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="mt-8">
                <h4 className="text-lg font-medium mb-4">Connect With Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((link, index) => (
                    <motion.a
                      key={index}
                      href={link.href}
                      className="bg-[#2D2D2D] hover:bg-[#333333] text-accent h-10 w-10 rounded-full flex items-center justify-center transition duration-300"
                      aria-label={`Social media link ${index + 1}`}
                      whileHover={{
                        scale: 1.2,
                        backgroundColor: "rgba(var(--theme-color-rgb), 0.2)",
                        color: "rgba(var(--theme-color-rgb), 1)",
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {link.icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
