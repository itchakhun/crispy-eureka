<template>
  <div class="max-w-2xl mx-auto px-4">
    <o-tabs v-model="activeLaunchTab" type="toggle" expanded>
      <o-tab-item label="All">
        <div></div>
      </o-tab-item>
      <o-tab-item label="Launched">
        <div></div>
      </o-tab-item>
      <o-tab-item label="Upcoming">
        <div></div>
      </o-tab-item>
    </o-tabs>
    <o-modal v-model:active="launchOpen" contentClass="w-full" width="600">
      <LaunchDetail :launch="activeLaunch" />
    </o-modal>
    <section v-if="loading">
      <!-- <o-skeleton size="medium" animated :count="3"></o-skeleton> -->
    </section>
    <ul v-else class="-mt-8">
      <li
        v-for="launch in launches"
        :key="launch.id"
        class="shadow border rounded p-5 mt-2 bg-white hover:bg-indigo-50 cursor-pointer"
        @click="openLaunch(launch.id)"
      >
        <div
          class="flex justify-between text-sm sm:items-center flex-col sm:flex-row"
        >
          <div class="flex items-center">
            <img
              :src="launch.links.patch.small || spaceXLogo"
              class="w-8 h-8 rounded-full bg-gray-600 border-2 inline-block"
            />
            <span class="text-lg ml-2 truncate">
              {{ launch.name }}
            </span>
          </div>
          <div
            class="flex-shrink-0 py-2 flex justify-between flex-row-reverse sm:flex-row"
          >
            <span
              class="ml-2 bg-blue-800 rounded-full px-2 text-white"
              :class="{ invisible: !launch.crew.length }"
            >
              {{ launch.crew.length }} crews
            </span>
            <span class="text-sm text-gray-600 ml-2">
              {{ getDateString(launch.date_utc) }}
            </span>
            <span v-if="activeLaunchTab < 2" class="ml-2">
              <span
                v-if="launch.upcoming"
                class="text-xs text-indigo-700 font-semibold rounded-full"
              >
                Upcoming
              </span>
              <span
                v-else
                class="text-xs text-green-700 font-semibold rounded-full"
              >
                Launched
              </span>
            </span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Axios from "axios";
import { defineComponent, nextTick, readonly, ref, watchEffect } from "vue";
import LaunchDetail from "@/components/LaunchDetail.vue";

const SPACE_X_LOGO_URL = `
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAeFBMVEUAAAD////y8vIYGBgzMzMjIyMGBgb7+/sTExPo6OjX19dra2uNjY21tbW8vLwcHByBgYFQUFB0dHRmZmaqqqouLi7IyMjV1dXi4uI6OjqkpKTu7u56enonJyecnJzOzs5AQECHh4eRkZFJSUlUVFQ+Pj5eXl5wcHCyU2VbAAACyElEQVR4nO3Xa3OiMBSAYcNdW0TBW4uXit36///hchIuAa07nRWd6bzPl5JDDuQYEuhoBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANzmJm7w7DEMxJ2n2ct27u2SX1hhlC6m8T47LZ89kEF4rysnj7NnD2Mgy3QVqslx9+xxDMQrJkpNZt6zxzGU7VqpcDFweW6rDkWJeyVqzHvpVteoCgWddNdNdHSZWF20U6yU2mzvXlGHvxo7rc27icaObXz4bBNe1clKj2I7PZ+Y0W7DTr4T6hV2zuV43+Sey+lTh8H3lnINdEx1dNqLqqbEL6XGVvpFx7NEj/2o2f4/NnJ88HVjK43J8HtnECqVjoJW0gw8qsKjpPyt4zohbn4FzSlHaacH5im03tXmGpWFrrec6Gxc/nUe8W4IyiG+XIalwrZVKLVqGjK0WdPSFf5AJgnzkzw54f7f3e9A5nCfvdS+qnC3woVd4Ulm4U/dul5hmo8r+bR3yl8XgZ7Jw9sdy7hl010wYaqjUuGkJl3e24xC9r+6cb3CWXvBy7MyjUod71/KN5J1aClvrbe9/gaytjd5OVmvy+8rTINEuP1z+tIb9/x+mTaYqBYsywF/1cN4rRVH8/Au44qM0cz1jQrPV+/1Kcu4/H3Kaxye8X2d2BX2T/p553E2H5E/rNC8Rgr9pKvwIZ/Z7s5vJW+3KkyLelKPcbMUHTmwLrHTLzupcOta4eoS5mUhd8hkQajFAyqc99/Nof9dhbZ1PbxVP18/vbN+1Cxj3Tk0e2iw1vvQAzbU8zi068vNZ5dUeOs/bF/2Q3mP+ivHrsQx+0e/QkcqjA5ymDc17eXG4cAfpdrSs1Sxnefd/nX9su+y7tqqds7E65Fg9CFHSffGbx/3LgcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4y+TVh5HJUyKZAAAAABJRU5ErkJggg==
`;
const LAUNCHES_ALL_URL = "https://api.spacexdata.com/v4/launches";
const LAUNCHES_PAST_URL = "https://api.spacexdata.com/v4/launches/past";
const LAUNCHES_UPCOMING_URL = "https://api.spacexdata.com/v4/launches/upcoming";

export default defineComponent({
  name: "App",
  components: {
    LaunchDetail
  },
  setup() {
    const spaceXLogo = SPACE_X_LOGO_URL;
    const activeLaunchTab = ref(1);
    const loading = ref(true);

    const activeLaunch = ref(null);
    const launchOpen = ref(false);
    const launchApis = readonly([
      LAUNCHES_ALL_URL,
      LAUNCHES_PAST_URL,
      LAUNCHES_UPCOMING_URL
    ]);
    const launches = ref([]);
    async function openLaunch(id: number) {
      activeLaunch.value = await Axios.get(`${LAUNCHES_ALL_URL}/${id}`).then(
        e => e.data
      );
      launchOpen.value = true;
    }
    watchEffect(async () => {
      loading.value = true;
      const getLaunchApi = launchApis[activeLaunchTab.value - 1];
      const res = await Axios.get(getLaunchApi);
      launches.value = res.data.sort((a: any, b: any) =>
        b.date_utc.localeCompare(a.date_utc)
      );
      await nextTick();
      loading.value = false;
    });

    function getDateString(dateString: string) {
      return new Date(dateString).toDateString();
    }

    return {
      activeLaunchTab,
      launches,
      openLaunch,
      launchOpen,
      activeLaunch,
      loading,
      getDateString,
      spaceXLogo
    };
  }
});
</script>

<style>
#app {
  @apply bg-gray-100 font-medium py-10;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-width: 100vw;
  min-height: 100vh;
}
</style>
