import Image from "next/image";
import LOGO from "@/public/logo-rmbg.png";

interface LogoProps {
  width?: number;
  height?: number;
}

const Logo = ({ width, height }: LogoProps) => {
  return (
    <Image
      src={LOGO.src}
      alt="LibroLink Logo"
      width={width || 200}
      height={height || 200}
      priority
    />
  );
};

export default Logo;
