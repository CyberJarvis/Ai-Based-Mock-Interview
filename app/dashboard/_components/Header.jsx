"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import { Brain, Home, FileText } from "lucide-react";

const Header = ({ logo }) => {
  const [isUserButtonLoaded, setUserButtonLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const SkeletonLoader = () => (
    <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserButtonLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const path = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [path]);

  useEffect(() => {
    console.log(path);
  }, []);

  return (
    <div className="bg-secondary shadow-sm">
      <div className="w-[80%] m-auto flex gap-4 items-center justify-between">
        <Link className="hidden md:block" href="/dashboard">
          <Image src={logo} width={80} height={80} alt="logo" />
        </Link>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-6">
          <Link href="/dashboard">
            <li
              className={`flex items-center gap-2 hover:text-black hover:font-bold transition-all cursor-pointer ${
                path == "/dashboard" && "text-black font-bold"
              }`}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </li>
          </Link>
          <Link href="/dashboard/dsa">
            <li
              className={`flex items-center gap-2 hover:text-black hover:font-bold transition-all cursor-pointer ${
                path == "/dashboard/dsa" && "text-black font-bold"
              }`}
            >
              <Brain className="w-4 h-4" />
              DSA
            </li>
          </Link>
          <Link href="/dashboard/question">
            <li
              className={`flex items-center gap-2 hover:text-black hover:font-bold transition-all cursor-pointer ${
                path == "/dashboard/question" && "text-black font-bold"
              }`}
            >
              <FileText className="w-4 h-4" />
              Questions
            </li>
          </Link>
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu} 
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>

        {/* User Controls */}
        <div className="flex gap-10">
          <ModeToggle />
          {isUserButtonLoaded ? <UserButton /> : <SkeletonLoader />}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-5">
            <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/dashboard" onClick={closeMenu}>
                <li
                  className={`flex items-center gap-2 hover:text-black hover:font-bold transition-all cursor-pointer py-2 px-3 rounded-md hover:bg-gray-100 ${
                    path == "/dashboard" && "text-black font-bold bg-gray-100"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </li>
              </Link>
              <Link href="/dashboard/dsa" onClick={closeMenu}>
                <li
                  className={`flex items-center gap-2 hover:text-black hover:font-bold transition-all cursor-pointer py-2 px-3 rounded-md hover:bg-gray-100 ${
                    path == "/dashboard/dsa" && "text-black font-bold bg-gray-100"
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  DSA Interview
                </li>
              </Link>
              <Link href="/dashboard/question" onClick={closeMenu}>
                <li
                  className={`flex items-center gap-2 hover:text-black hover:font-bold transition-all cursor-pointer py-2 px-3 rounded-md hover:bg-gray-100 ${
                    path == "/dashboard/question" && "text-black font-bold bg-gray-100"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Questions
                </li>
              </Link>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
