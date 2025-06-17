"use client";

import { siteConfig } from "@/config/site";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  const iconVariants = {
    hover: {
      scale: 1.3,
      color: "hsl(var(--primary))",
      transition: { duration: 0.3, type: "spring", stiffness: 300 }
    },
    tap: {
      scale: 0.9,
      transition: { duration: 0.1 }
    }
  };

  const footerTextVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.3, duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.footer
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="border-t border-border/40 bg-gradient-to-r from-background/80 via-background/95 to-background/80 py-8 shadow-lg"
    >
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <motion.p
          variants={footerTextVariants}
          className="text-sm text-muted-foreground font-semibold"
        >
          &copy; {new Date().getFullYear()} {siteConfig.name}. Built by The Saurav Kumar.
        </motion.p>
        <div className="flex items-center space-x-6">
          <motion.div whileHover="hover" whileTap="tap" variants={iconVariants}>
            <Link href={siteConfig.links.twitter} target="_blank" rel="noreferrer" aria-label="Twitter">
              <Twitter className="h-6 w-6 text-muted-foreground transition-colors" />
            </Link>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap" variants={iconVariants}>
            <Link href={siteConfig.links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github className="h-6 w-6 text-muted-foreground transition-colors" />
            </Link>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap" variants={iconVariants}>
            <Link href={siteConfig.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin className="h-6 w-6 text-muted-foreground transition-colors" />
            </Link>
          </motion.div>
          {/* Uncomment if email icon is needed
          <motion.div whileHover="hover" whileTap="tap" variants={iconVariants}>
            <Link href={siteConfig.links.email} aria-label="Email">
              <Mail className="h-6 w-6 text-muted-foreground transition-colors" />
            </Link>
          </motion.div>
          */}
        </div>
      </div>
    </motion.footer>
  );
}
