import Homelayout from "@/components/layout/home-layout";
import { Pricing } from "@/components/pricing";
import React from "react";

function page() {
  return (
    <Homelayout>
      {" "}
      <Pricing />{" "}
    </Homelayout>
  );
}

export default page;
