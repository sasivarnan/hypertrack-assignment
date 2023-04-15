import { MapPinIcon } from "@heroicons/react/24/outline";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

const MapRouteList = ({ paths }) => {
  const parentRef = useRef();

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: paths.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });

  return (
    <div className="fixed bottom-4 left-4 top-4 bg-white shadow-md">
      <h3 className="px-4 py-2 text-xl font-bold">Route Points </h3>
      <div
        ref={parentRef}
        className="h-[calc(100vh-76px)] w-60 overflow-auto px-4"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = paths[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="absolute left-0 top-0 flex w-full items-center gap-4 py-2"
              >
                <MapPinIcon className="h-5 w-5" />
                <span>
                  {" "}
                  {item[0].toFixed(4)}, {item[1].toFixed(4)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapRouteList;
