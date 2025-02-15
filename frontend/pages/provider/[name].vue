<template>
  <div>
    <h1
      class="flex flex-row justify-center mx-5 mt-4 text-4xl text-center text-slate-800 space-x-2"
    >
      {{ title }}
    </h1>

    <!-- menu -->
    <div class="mx-5 mt-4 border-b pb-2">
      <div class="mb-4 justify-center space-x-2 flex">
        <n-button @click="reset">Reset</n-button>

        <n-button @click="copyURL">Copy URL</n-button>
      </div>
      <cost-table-region-menu
        class="border-b pb-4"
        :available-region-list="state.availableRegions"
        :checked-region-list="searchConfigStore.searchConfig.region"
        @update-region="handleUpdateRegion"
      />

      <cost-table-menu
        :has-provider="false"
        :cloud-provider="searchConfigStore.searchConfig.cloudProvider"
        :engine-type="searchConfigStore.searchConfig.engineType"
        :charge-type="searchConfigStore.searchConfig.chargeType"
        :keyword="searchConfigStore.searchConfig.keyword"
        :min-r-a-m="searchConfigStore.searchConfig.minRAM"
        :min-c-p-u="searchConfigStore.searchConfig.minCPU"
        :utilization="searchConfigStore.searchConfig.utilization"
        :lease-length="searchConfigStore.searchConfig.leaseLength"
        @update-cloud-provider="handleUpdateCloudProvider"
        @update-engine-type="handleUpdateEngineType"
        @update-charge-type="handleUpdateChargeType"
        @update-keyword="handleUpdateKeyword"
        @update-min-vcpu="handleUpdateMinCPU"
        @update-min-ram="handleUpdateMinRAM"
        @update-utilization="handleUpdateUtilization"
        @update-lease-length="handleUpdateLeaseLength"
      />
    </div>

    <!-- dashboard -->
    <div class="mx-5 mt-4">
      <cost-table
        class="mt-4"
        :utilization="searchConfigStore.searchConfig.utilization"
        :lease-length="searchConfigStore.searchConfig.leaseLength"
        :data-row="dataTableItemStore.dataRow"
        :is-loading="state.isLoading"
        :show-engine-type="showEngineType"
        :show-lease-length="showLeaseLength"
        :checked-row-keys="dataTableItemStore.checkedRowKey"
        :show-diff="searchConfigStore.searchConfig.chargeType?.length === 2"
        @update-checked-row-keys="(val:string[]) => handleCheckRowKeys(val)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { NButton, useNotification } from "naive-ui";
import {
  AvailableRegion,
  ChargeType,
  CloudProvider,
  EngineType,
  RouteQueryDashBoard,
  SearchConfig,
} from "@/types";
import {
  useSearchConfigStore,
  useDBInstanceStore,
  useDataTableItemStore,
} from "@/stores";

import { isEmptyArray, isConfigChange, isRefreshNeeded } from "@/util";

const dbInstanceStore = useDBInstanceStore();
const dataTableItemStore = useDataTableItemStore();

watch(
  () => dbInstanceStore.dbInstanceList.length,
  () => {
    state.availableRegions = dbInstanceStore.getAvailableRegionList();
    dataTableItemStore.refresh();
  }
);

const searchConfigStore = useSearchConfigStore();

interface LocalState {
  availableRegions: AvailableRegion[];
  isLoading: boolean;
  lastConfig: SearchConfig;
}

const state = reactive<LocalState>({
  availableRegions: [],
  isLoading: false,
  lastConfig: { ...searchConfigStore.searchConfig },
});

const title = computed(() => {
  const curRoute = router.currentRoute.value;
  if (curRoute.params.name === "aws") {
    return `The Ultimate AWS RDS Instance Pricing Sheet`;
  }
  if (curRoute.params.name === "gcp") {
    return `The Ultimate Google Cloud SQL Instance Pricing Sheet`;
  }
  router.push({ name: "404" });
});

const handleUpdateRegion = (val: string[]) => {
  searchConfigStore.searchConfig.region = val;
};
const handleUpdateCloudProvider = (val: CloudProvider[]) => {
  searchConfigStore.searchConfig.cloudProvider = val;
};
const handleUpdateEngineType = (val: EngineType[]) => {
  searchConfigStore.searchConfig.engineType = val;
};
const handleUpdateChargeType = (val: ChargeType[]) => {
  searchConfigStore.searchConfig.chargeType = val;
};
const handleUpdateKeyword = (val: string) => {
  searchConfigStore.searchConfig.keyword = val;
};
const handleUpdateMinRAM = (val: any) => {
  searchConfigStore.searchConfig.minRAM = val;
};
const handleUpdateMinCPU = (val: any) => {
  searchConfigStore.searchConfig.minCPU = val;
};
const handleUpdateLeaseLength = (val: number) => {
  searchConfigStore.searchConfig.leaseLength = val;
};
const handleUpdateUtilization = (val: number) => {
  searchConfigStore.searchConfig.utilization = val;
};
const handleCheckRowKeys = (rowKeys: string[]) => {
  const checkRowKey = dataTableItemStore.checkedRowKey;
  // a key is added
  if (rowKeys.length > checkRowKey.length) {
    const set = new Set(checkRowKey);
    for (const rowKey of rowKeys) {
      if (!set.has(rowKey)) {
        dataTableItemStore.addCheckedDataRowByKey(rowKey);
      }
    }
  }
  // a key is removed
  else {
    const set = new Set(rowKeys);
    for (const rowKey of checkRowKey) {
      if (!set.has(rowKey)) {
        dataTableItemStore.removeCheckedDataRowByKey(rowKey);
      }
    }
  }
};

const router = useRouter();
const config = ref(searchConfigStore.searchConfig);
watch(
  config,
  () => {
    // if any of the following config has changed, we need to update the route
    if (isConfigChange(state.lastConfig, config.value)) {
      const config = searchConfigStore.searchConfig;
      const routeQuery: RouteQueryDashBoard = {
        provider: undefined,
        region: isEmptyArray(config.region)
          ? undefined
          : config.region?.join(","),
        engine: isEmptyArray(config.engineType)
          ? undefined
          : config.engineType?.join(","),
        charge: isEmptyArray(config.chargeType)
          ? undefined
          : config.chargeType?.join(","),
        minCPU: config.minCPU === 0 ? undefined : config.minCPU,
        minRAM: config.minRAM === 0 ? undefined : config.minRAM,
        keyword: config.keyword === "" ? undefined : config.keyword,
        utilization: config.utilization,
        lease: config.leaseLength,
      };

      const curRoute = router.currentRoute.value;
      router.push({
        name: curRoute.name as string,
        query: routeQuery,
      });
    }
  },
  {
    deep: true,
  }
);

const notification = useNotification();
const copyURL = () => {
  // Nuxt: document is only available at the client side (browser)
  navigator.clipboard
    .writeText(document.location.href)
    .then(() => {
      notification.success({
        content: "Successfully copied to clipboard",
        duration: 2000,
      });
    })
    .catch(() => {
      notification.error({
        content: "Fail to copy, please try again",
        duration: 2000,
      });
    });
};

watch(
  config, // ref to searchConfigStore.searchConfig
  (newConfig) => {
    // if any of the following config has changed, we need to update the entire table
    if (isRefreshNeeded(state.lastConfig, newConfig)) {
      // We set the dataRow to empty here for a better animation.
      // Otherwise the loading circle would appear right in the middle of the data table, which may be elusive.
      dataTableItemStore.clearDataRow();
      state.isLoading = true;
      setTimeout(() => {
        dataTableItemStore.refresh();
        state.isLoading = false;
      }, 100);
    } else {
      // otherwise, we only need to update the expected cost
      dataTableItemStore.refreshExpectedCost();
    }

    state.lastConfig = { ...newConfig };
  },
  {
    deep: true,
  }
);

const showEngineType = computed(
  () => config.value.engineType && config.value.engineType.length > 1
);
const showLeaseLength = computed(() => {
  const chargeTypeSet = new Set(config.value.chargeType);
  return chargeTypeSet.size > 1 || chargeTypeSet.has("Reserved");
});

const reset = () => {
  searchConfigStore.setToDefault();
};

onMounted(() => {
  state.availableRegions = dbInstanceStore.getAvailableRegionList();
  dataTableItemStore.refresh();
});
</script>
