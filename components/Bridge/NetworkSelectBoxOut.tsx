import React from "react";
import Image from "next/image";
import { Appstate } from ".";
import { extendprops } from "./NetworkSelectBoxIn";
import { ImageMap, image_map, networkname_map } from "./utils";

const NetworksSelectBoxOut: React.FC<Omit<Appstate, "tokenAmount"> & extendprops> = ({ networkOut }) => {
  return (
    <div>
      <p>Assets To</p>
      <div className="px-4 py-3 cursor-pointer rounded-2xl bg-primary/40">
        <div className="w-full dropdown dropdown-bottom">
          <div tabIndex={0} role="button" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 overflow-hidden rounded-full">
                <Image src={image_map[networkOut as keyof ImageMap]} fill objectFit="cover" alt={`NetworkIcon`} />
              </div>
              <p>{networkname_map[networkOut as keyof ImageMap]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworksSelectBoxOut;
