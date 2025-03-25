import React from "react";
import compact_logo from "../assets/logo_compact.png";

interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

const Loading: React.FC<LoaderProps> = ({
  fullScreen = true,
  text = "Cargando...",
  className,
}) => {
  return (
    <div
      className={`${
        fullScreen
          ? "min-h-screen min-w-screen w-screen h-screen bg-black/40 z-50 fixed top-0 left-0 flex flex-col items-center justify-center m-0 p-0"
          : "h-auto flex flex-col items-center justify-center"
      } z-50 ${className}`}
    >
      {fullScreen && (
        <>
          <div className="spinner" />
          <img
            src={compact_logo}
            alt="Loader"
            width={45}
            height={45}
            className="w-12 h-12 my-[2ch] fade"
          />
        </>
      )}
      <p className="text">
        {fullScreen ? (
          <span className="text-fade text-white font-semibold">
            {text ? text : "Cargando..."}
          </span>
        ) : (
          <span className="text-fade text-white font-semibold">
            {text ? text : "Recibiendo información..."}
          </span>
        )}
      </p>
    </div>
  );
};

export default Loading;
