import { useEffect } from "react";
import type { NextPage } from "next";
import MainLayout from "@/layouts/main";
import ButtonGroup from "@/components/ButtonGroup";
import RegionMenu from "@/components/RegionMenu";
import SearchMenu from "@/components/SearchMenu";
import CompareTable from "@/components/CompareTable";
import { useDBInstanceStore, useAvailableRegionList } from "@/stores";

const Home: NextPage = () => {
  const loadDBInstanceList = useDBInstanceStore(
    (state) => state.loadDBInstanceList
  );

  useEffect(() => {
    loadDBInstanceList();
  }, [loadDBInstanceList]);

  const availableRegionList = useAvailableRegionList();

  return (
    <MainLayout title="The Ultimate AWS RDS and Google Cloud SQL Instance Pricing Sheet">
      <div className="mx-5 mt-4 pb-2">
        <ButtonGroup />
        <RegionMenu availableRegionList={availableRegionList} />
        <SearchMenu />
        <CompareTable />
      </div>
    </MainLayout>
  );
};

export default Home;
