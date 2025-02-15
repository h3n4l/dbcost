<template>
  <div
    class="fixed w-96 h-full bg-white z-10 transition-all duration-500"
    :class="isCollapsed ? '-right-96' : 'right-0'"
  >
    <!-- top title -->
    <div class="fixed w-96 bg-white pt-1">
      <div class="mt-1 px-1">
        <n-button
          :disabled="dataTableItemStore.checkedRowKey.length === 0"
          class="text-center w-full bg-green-600"
          type="primary"
          @click="handleClickCompare"
        >
          <heroicons-solid:database class="" />
          <span class="ml-1 text-base align-middle">Compare Instance</span>
        </n-button>
      </div>
    </div>

    <!-- content -->
    <div class="fixed w-96 overflow-scroll h-full top-10 z-10 border-t mt-2">
      <div class="mt-2">
        <!-- Checked Instance Card -->
        <div
          class="border-b hover:bg-gray-200 mx-1 mb-1"
          v-for="dataRow in dataTableItemStore.checkedDataRow"
        >
          <!-- delete byn -->
          <div
            class="flex float-right w-8 h-8 hover:bg-red-600 text-gray-400 hover:text-white click:bg-red-700 justify-center"
            @click.prevent="() => handleDeleteCard(dataRow.key)"
          >
            <heroicons-solid:trash class="place-self-center" />
          </div>

          <!-- main content -->
          <div class="px-2 py-1">
            <!-- title -->
            <div class="flex mb-1">
              <div class="text-base font-mono">
                {{ dataRow.name }}
              </div>
              <div></div>
            </div>

            <!-- body -->
            <div class="mb-0.5">
              <div class="text-xs font-mono">
                <strong>{{ dataRow.cpu }}</strong> CPU,
                <strong>{{ dataRow.memory }}</strong> GiB
              </div>

              <div class="text-xs font-mono">{{ dataRow.region }}</div>
              <div class="text-xs font-mono flex">
                <img
                  color="none"
                  :src="EngineIcon[dataRow.engineType].src"
                  width="16"
                />

                <img
                  color="none"
                  class="ml-1 py-0.5"
                  :src="ProviderIcon[dataRow.cloudProvider].src"
                  width="16"
                />
              </div>
            </div>

            <!-- footer -->
            <div class="text-right">
              <div class="text-xs font-mono">
                ${{ dataRow.commitment.usd }} + ${{
                  dataRow.hourly.usd.toFixed(2)
                }}/hour
              </div>

              <div class="text-xs font-mono">
                {{
                  dataRow.leaseLength === "N/A"
                    ? "On Demand"
                    : `Reserved for ${dataRow.leaseLength}`
                }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="dataTableItemStore.checkedDataRow.length === 0"
          class="text-center"
        >
          <heroicons-outline:emoji-sad class="mt-4 text-lg inline" />

          <div class="text-base font-semibold mt-4">No Instance Selected</div>
        </div>
      </div>
    </div>
  </div>

  <!-- collapse btn -->
  <div
    class="fixed top-1/2 bg-white rounded-2xl z-0 hover:bg-gray-300 opacity-50 transition-all duration-500"
    :style="isCollapsed ? 'right: -9900px' : 'right: 373px'"
    @click="() => emit('collapse', true)"
  >
    <heroicons-solid:chevron-right class="text-2xl pr-1" />
  </div>
</template>
<script lang="ts" setup>
import { NButton, NAvatar } from "naive-ui";
import { useDataTableItemStore } from "@/stores";
import { RouteQueryCompare } from "@/types";
import { getIconPath } from "@/util";

const dataTableItemStore = useDataTableItemStore();

const handleDeleteCard = (dataRowKey: string) => {
  dataTableItemStore.removeCheckedDataRowByKey(dataRowKey);
};

const router = useRouter();
const handleClickCompare = () => {
  const routeQuery: RouteQueryCompare = {
    instance: dataTableItemStore.checkedRowKey.join(","),
  };

  router.push({ name: "compare", query: routeQuery }).then(() => {
    emit("collapse", true);
  });
};

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "collapse", isCollapsed: boolean): void;
}>();

const ProviderIcon: any = {
  GCP: {
    src: getIconPath("gcp.png"),
  },
  AWS: {
    src: getIconPath("aws.png"),
  },
};

const EngineIcon: any = {
  MYSQL: {
    src: getIconPath("db-mysql.png"),
  },

  POSTGRES: {
    src: getIconPath("db-postgres.png"),
  },
};
</script>
