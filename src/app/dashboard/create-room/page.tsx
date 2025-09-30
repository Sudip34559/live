import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import Layout from "@/components/layout/layout";
import React from "react";
import data from "../data.json";
import { SectionCards } from "@/components/section-cards";
function page() {
  return (
    <Layout>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </Layout>
  );
}

export default page;
