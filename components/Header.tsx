import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

/**
 * Site header
 */
import logo from "../public/logo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Bars3Icon } from "@heroicons/react/24/outline";
// BugAntIcon
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

interface HeaderMenuLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  // {
  //   label: "Debug Contracts",
  //   href: "/debug",
  //   icon: <BugAntIcon className="w-4 h-4" />,
  // },
];

export const HeaderMenuLinks = () => {
  const router = useRouter();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = router.pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className="sticky top-0 z-20 justify-between flex-shrink-0 min-h-0 px-0 shadow-md lg:static navbar bg-base-100 shadow-secondary sm:px-2">
      <div className="w-auto navbar-start lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
        </div>
        <Link href="/" passHref className="items-center hidden gap-2 ml-4 mr-6 lg:flex shrink-0">
          <div className="relative flex w-10 h-10">
            <Image
              alt="SE2 logo"
              className="cursor-pointer"
              fill
              src={
                "https://img.notionusercontent.com/ext/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2Ff491f02b-94d2-49e5-acd0-2723808de982%2FSuave_Logo_copy.png/size/w=40?exp=1732201755&sig=uPzdV6zRf9qrkIJE84U_I9OhFNU6DV5IIc1TJ11OiL0"
              }
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Suave Protocol</span>
            {/* <span className="text-xs">Ethereum dev stack</span> */}
          </div>
        </Link>
      </div>
      <div className="flex-grow mr-4 navbar-end">
        <ConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
