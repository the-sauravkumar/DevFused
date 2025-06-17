"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { siteConfig } from "@/config/site";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { Github, Linkedin, Twitter, Mail, Send, Sparkles, MessageCircle } from "lucide-react";
import React, { useRef, useState } from "react";

const contactFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// Keep original title animations
const titleContainerAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const titleAnimation = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const subtitleAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Enhanced animations for content
const formContainerAnimation = {
  hidden: { opacity: 0, x: -60, rotateY: -15 },
  visible: { 
    opacity: 1, 
    x: 0, 
    rotateY: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.4
    } 
  },
};

const socialLinksContainerAnimation = {
  hidden: { opacity: 0, x: 60, rotateY: 15 },
  visible: { 
    opacity: 1, 
    x: 0, 
    rotateY: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.5
    } 
  },
};

const inputVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  },
};

const socialLinkVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  },
  hover: {
    scale: 1.05,
    y: -8,
    backgroundColor: "hsl(var(--primary) / 0.05)",
    borderColor: "hsl(var(--primary))",
    boxShadow: "0 20px 40px hsla(var(--primary), 0.15), 0 0 0 1px hsla(var(--primary), 0.1)",
    transition: { 
      duration: 0.3, 
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 400,
      damping: 25
    },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.02,
    boxShadow: "0 10px 30px hsla(var(--primary), 0.3)",
    transition: { 
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

export function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: "",
      subject: "",
      message: "",
    },
  });

  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, amount: 0.2 });
  
  const contentRef = useRef(null);
  const isContentInView = useInView(contentRef, { once: true, amount: 0.1 });

  // Smooth spring animation for sparkles
  const sparkleSpring = useSpring(0, { stiffness: 100, damping: 30 });
  const sparkleRotate = useTransform(sparkleSpring, [0, 1], [0, 360]);

  const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
    try {
      setIsSubmitting(true);
      sparkleSpring.set(1);
      
      // Create mailto URL with enhanced formatting
      const mailtoUrl = `mailto:thesauravkumar@hotmail.com?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.message)}`;
      
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      window.location.href = mailtoUrl;
      
      toast({
        title: "✨ Opening Mail App",
        description: "Your default mail application should open with the message pre-filled.",
        className: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/20 shadow-lg",
      });
      
      setTimeout(() => {
        form.reset();
        setIsSubmitting(false);
        sparkleSpring.set(0);
      }, 1200);
      
    } catch (error) {
      setIsSubmitting(false);
      sparkleSpring.set(0);
      const errorMessage = error instanceof Error ? error.message : "Failed to open mail application. Please try again.";
      toast({
        title: "❌ Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <section id="contact" className="container py-24 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Original title section preserved */}
      <motion.div
        ref={titleRef}
        initial="hidden"
        animate={isTitleInView ? "visible" : "hidden"}
        variants={titleContainerAnimation}
        className="text-center mb-16"
      >
        <motion.h2 variants={titleAnimation} className="text-3xl md:text-4xl font-bold font-headline">
          Get In <span className="text-primary">Touch</span>
        </motion.h2>
        <motion.p variants={subtitleAnimation} className="text-muted-foreground max-w-xl mx-auto mt-4 text-lg">
          Have a project in mind, a question, or just want to connect? Feel free to reach out.
        </motion.p>
      </motion.div>

      <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial="hidden"
          animate={isContentInView ? "visible" : "hidden"}
          variants={formContainerAnimation}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-2xl blur-xl" />
          <div className="relative bg-card/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-border/20 hover:border-primary/30 transition-all duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-xl">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold font-headline text-foreground">
                Send me a message
              </h3>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <motion.div variants={inputVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground/80">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your.email@example.com" 
                            {...field} 
                            className="h-12 bg-background/50 border-0 focus:border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl shadow-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={inputVariants}>
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground/80">
                          Subject
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="What's this about?" 
                            {...field} 
                            className="h-12 bg-background/50 border-0 focus:border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl shadow-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={inputVariants}>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground/80">
                          Message
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your message here..." 
                            rows={5} 
                            {...field} 
                            className="bg-background/50 border-0 focus:border-0 focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl resize-none shadow-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Opening Mail App...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        Send Message
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isContentInView ? "visible" : "hidden"}
          variants={socialLinksContainerAnimation}
          className="space-y-6"
        >
          <h3 className="text-2xl font-semibold font-headline mb-2 text-foreground">Or find me on</h3>
          <p className="text-muted-foreground mb-6">
            Connect with me through various platforms. I'm always open to new opportunities and collaborations.
          </p>
          <div className="space-y-4">
            <SocialLink href={siteConfig.links.linkedin} icon={Linkedin} label="LinkedIn" />
            <SocialLink href={siteConfig.links.github} icon={Github} label="GitHub" />
            <SocialLink href={siteConfig.links.twitter} icon={Twitter} label="Twitter / X" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const SocialLink = ({ 
  href, 
  icon: Icon, 
  label 
}: { 
  href: string; 
  icon: React.ElementType; 
  label: string;
}) => (
  <motion.div
    variants={socialLinkVariants}
    whileHover="hover"
    whileTap="tap"
  >
    <Link
      href={href}
      target={href.startsWith("mailto:") ? "_self" : "_blank"}
      rel="noopener noreferrer"
      className="group flex items-center space-x-4 p-6 bg-card/60 backdrop-blur-sm rounded-xl shadow-lg border border-border/30 transition-all duration-300 hover:bg-card/80"
    >
      <Icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-200" />
      <span className="text-md text-foreground group-hover:text-primary transition-colors duration-200">{label}</span>
    </Link>
  </motion.div>
);
