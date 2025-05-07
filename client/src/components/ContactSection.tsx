import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock,
  Twitter,
  Linkedin,
  Facebook,
  Instagram
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type FormValues = z.infer<typeof formSchema>;

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
      title: 'Our Location',
      content: (
        <>
          123 Innovation Drive<br />
          Tech City, TC 98765
        </>
      )
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: 'Email Us',
      content: (
        <a 
          href="mailto:info@nakutaro.com" 
          className="text-gray-400 hover:text-[#FF3B30] transition duration-300"
        >
          info@nakutaro.com
        </a>
      )
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: 'Call Us',
      content: (
        <a 
          href="tel:+1234567890" 
          className="text-gray-400 hover:text-[#FF3B30] transition duration-300"
        >
          +1 (234) 567-890
        </a>
      )
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Working Hours',
      content: (
        <>
          Monday - Friday: 9AM - 6PM<br />
          Saturday: 10AM - 2PM
        </>
      )
    }
  ];

  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, href: '#' },
    { icon: <Linkedin className="h-5 w-5" />, href: '#' },
    { icon: <Facebook className="h-5 w-5" />, href: '#' },
    { icon: <Instagram className="h-5 w-5" />, href: '#' }
  ];

  return (
    <section id="contact" className="py-20 bg-[#1E1E1E]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.span 
            variants={fadeIn('up', 'tween', 0.1, 1)}
            className="text-[#FF3B30] font-semibold text-sm uppercase tracking-wider"
          >
            Contact Us
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Get in Touch
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Have a question or ready to start your project? Contact us today.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            variants={fadeIn('right', 'tween', 0.2, 1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your Name" 
                          {...field} 
                          className="w-full bg-[#2D2D2D] border border-[#333333] focus:border-[#FF3B30] rounded-md px-4 py-3 text-white focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your@email.com" 
                          type="email"
                          {...field} 
                          className="w-full bg-[#2D2D2D] border border-[#333333] focus:border-[#FF3B30] rounded-md px-4 py-3 text-white focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Subject</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="How can we help?" 
                          {...field} 
                          className="w-full bg-[#2D2D2D] border border-[#333333] focus:border-[#FF3B30] rounded-md px-4 py-3 text-white focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your project" 
                          rows={5}
                          {...field} 
                          className="w-full bg-[#2D2D2D] border border-[#333333] focus:border-[#FF3B30] rounded-md px-4 py-3 text-white focus:outline-none resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF3B30] hover:bg-[#CC2F26] text-white font-medium py-3 px-6 rounded-md transition duration-300 shadow-lg"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Form>
          </motion.div>
          
          <motion.div
            variants={fadeIn('left', 'tween', 0.4, 1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="bg-[#121212] p-8 rounded-xl border border-[#2D2D2D] h-full">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-[#2D2D2D] text-[#FF3B30]">
                        {item.icon}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium mb-1">{item.title}</h4>
                      <p className="text-gray-400">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h4 className="text-lg font-medium mb-4">Connect With Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((link, index) => (
                    <a 
                      key={index}
                      href={link.href} 
                      className="bg-[#2D2D2D] hover:bg-[#333333] text-[#FF3B30] h-10 w-10 rounded-full flex items-center justify-center transition duration-300"
                      aria-label={`Social media link ${index + 1}`}
                    >
                      {link.icon}
                    </a>
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
