import React from "react";
import { useUIContext } from "@/app/providers/UIProvider";
import EthereumLogo from "@/icons/ethereum.svg";
import type { VariantProps } from "class-variance-authority";
import { ConnectKitButton, useModal } from "connectkit";
import { useConnect } from "wagmi";

import type { buttonVariants } from "@realms-world/ui";
import { Button } from "@realms-world/ui";

export const EthereumLoginButton = ({
  openAccount = false,
  variant,
  textClass,
  buttonClass,
}: {
  openAccount?: boolean;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  textClass?: string;
  buttonClass?: string;
}) => {
  const { connectors, isLoading } = useConnect();
  const modal = useModal({
    onConnect() {
      !isAccountOpen && openAccount && toggleAccount();
    },
  });
  const { isAccountOpen, toggleAccount } = useUIContext();

  if (!connectors) {
    return null;
  }

  return (
    <ConnectKitButton.Custom>
      {({ show, isConnected, isConnecting, truncatedAddress, ensName }) => (
        <Button
          className={
            buttonClass +
            " outline-bright-yellow rounded-none px-3 outline outline-2 outline-offset-[3px] " +
            (isConnected && "!shadow-[0_0_10px_rgb(74,222,128)] ")
          }
          variant={variant ?? "outline"}
          size="lg"
          onClick={() => (isConnected ? toggleAccount() : show?.())}
        >
          <span className="flex items-center font-sans normal-case">
            <EthereumLogo className="w-6" />
            <span className={`hidden pl-2 ${textClass ?? "sm:block"}`}>
              {isConnected ? (
                ensName ?? truncatedAddress
              ) : (
                <>
                  Ethereum
                  {isConnecting ||
                    (isLoading && (
                      <div className="absolute right-0">
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        ></svg>
                      </div>
                    ))}
                </>
              )}
            </span>
          </span>
        </Button>
      )}
    </ConnectKitButton.Custom>
  );
};
