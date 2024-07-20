"use client";

import React from "react";
import BrownButton from "../common/Button";
import { useRouter } from "next/navigation";

const Library = () => {
  const router = useRouter();

  return (
    <>
      <BrownButton onClick={() => router.push("/library/create")}>
        Create reading log
      </BrownButton>
    </>
  );
};

export default Library;
