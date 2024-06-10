"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
  Badge,
  Box,
  Center,
  Image,
  VStack,
  Heading,
  useBreakpointValue,
  Button,
} from "@chakra-ui/react";
import Buddy1 from "@/public/buddy1.jpg";
import Buddy2 from "@/public/buddy2.jpg";
import Buddy3 from "@/public/buddy3.jpg";

const buddies = [
  { src: Buddy1.src, name: "Buddy 1", id: 1, color: "brand.warmBeige" },
  { src: Buddy2.src, name: "Buddy 2", id: 2, color: "brand.mistyRose" },
  { src: Buddy3.src, name: "Buddy 3", id: 3, color: "brand.sageGreen" },
];

const Buddies = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const isCarousel = useBreakpointValue({ base: true, md: false });

  const toggleSelected = (id: number) => {
    setSelected((prev) => (prev === id ? null : id));
  };

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      spaceBetween={50}
      slidesPerView={isCarousel ? 1 : 3}
      navigation
      pagination={{ clickable: true }}
      onSlideChange={() => console.log("slide change")}
      onSwiper={(swiper) => console.log(swiper)}
    >
      {buddies.map((buddy, index) => (
        <SwiperSlide key={index}>
          <Center p={isCarousel ? 8 : 4} m={isCarousel ? 8 : 4}>
            <Box
              textAlign="center"
              cursor="pointer"
              borderRadius="md"
              overflow="hidden"
              onClick={() => toggleSelected(buddy.id)}
              sx={{
                position: "relative",
                border: "4px solid",
                borderColor:
                  selected === buddy.id ? buddy.color : "transparent",
                transition: "border-color 0.3s ease-in-out",
                "&:hover": {
                  borderColor: buddy.color,
                  boxShadow: `0 0 20px ${buddy.color}`,
                },
              }}
            >
              {selected === buddy.id && (
                <Badge
                  position="absolute"
                  bg="brand.darkChocolate"
                  color="white"
                  px={2}
                  right="0"
                  bottom="0"
                  borderRadius="md"
                >
                  Selected
                </Badge>
              )}
              <Image src={buddy.src} alt={buddy.name} w="100%" h="auto" />
            </Box>
          </Center>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Buddies;
