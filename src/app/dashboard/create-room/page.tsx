import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import Layout from "@/components/layout/layout";
import React from "react";
import data from "../data.json";
import { SectionCards } from "@/components/section-cards";
import { RoomCards } from "@/components/room-cards";
function page() {
  return (
    <Layout>
      <RoomCards />
      <DataTable data={data} />
    </Layout>
  );
}

export default page;
