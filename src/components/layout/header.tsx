"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig, type NavItem } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun, BotMessageSquare } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { useScrollspy } from "@/hooks/use-scrollspy";

interface HeaderProps {
  onChatbotToggle: () => void;
}

export function Header({ onChatbotToggle }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => setIsMounted(true), []);
  
  const activeId = useScrollspy(siteConfig.mainNav.map(item => item.href.substring(1)), 100);

  const NavLink = ({ item, className }: { item: NavItem, className?: string }) => (
    <Link
      href={item.href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        item.href.substring(1) === activeId ? "text-primary" : "text-foreground/80",
        className
      )}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {item.title}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          {/* <BotMessageSquare className="h-6 w-6 text-primary" /> */}
          <Image src="/glitch.png" alt="Bot Icon" width={24} height={24} className="text-primary"/>
          <span className="font-bold font-headline">Portfolio</span>
        </Link>

        <nav className="hidden items-center space-x-6 md:flex">
          {siteConfig.mainNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="flex items-center space-x-2">
           <Button variant="ghost" size="icon" aria-label="Toggle Chatbot" onClick={onChatbotToggle} className="hidden md:inline-flex">
            <BotMessageSquare className="h-5 w-5" />
          </Button>
          {isMounted && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle Theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <div className="flex flex-col space-y-6 p-6">
                <Link href="/" className="flex items-center space-x-2 mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                  <BotMessageSquare className="h-6 w-6 text-primary" />
                  <span className="font-bold font-headline">{siteConfig.name}</span>
                </Link>
                {siteConfig.mainNav.map((item) => (
                  <NavLink key={item.href} item={item} className="text-lg" />
                ))}
                <Button variant="outline" aria-label="Toggle Chatbot" onClick={() => { onChatbotToggle(); setIsMobileMenuOpen(false); }} className="w-full mt-4">
                  <BotMessageSquare className="mr-2 h-5 w-5" /> Chat with AI
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
