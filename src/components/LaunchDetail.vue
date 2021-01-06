<template>
  <div class="px-5 w-full text-center divide-y launch-details">
    <section>
      <h2 class="text-3xl text-center mb-2">
        {{ launch.name }}
      </h2>
      <div class="text-gray-600 text-sm">
        <o-icon pack="mdi" icon="calendar-blank-outline" />{{
          getDate(launch.date_utc)
        }}
      </div>
    </section>
    <section v-if="crews.length">
      <h2 class="heading">Crews</h2>
      <div class="flex justify-center mt-3">
        <div
          v-for="crew in crews"
          :key="crew.id"
          class="text-center mx-2 flex flex-col items-center"
        >
          <div
            :style="{ 'background-image': `url(${crew.image})` }"
            class="w-20 h-20 rounded-full bg-cover mb-2 border-2 shadow"
          />
          <p>{{ crew.name }}</p>
        </div>
      </div>
    </section>
    <section v-if="rocket">
      <h2 class="heading">Rocket</h2>
      <h3 class="text-lg text-center">{{ rocket.name }}</h3>
      <div>
        <img :src="rocket.flickr_images?.[0]" />
      </div>
    </section>
    <section v-if="launchpad">
      <h2 class="heading">Launchpad</h2>
      <p>{{ launchpad.full_name }}, {{ launchpad.region }}</p>
    </section>
    <section v-if="launch.details">
      <h2 class="heading">Details</h2>

      <p class="text-left">
        {{ launch.details }}
      </p>
    </section>
  </div>
</template>

<script>
import Axios from "axios";
import { defineComponent, onMounted, ref, toRefs } from "vue";
import apis from "@/apis";
export default defineComponent({
  props: {
    launch: Object
  },
  setup(props) {
    const { launch } = toRefs(props);
    const crews = ref([]);
    async function getCrew() {
      const resAll = await Axios.all(
        launch.value.crew.map(crew => apis.get(`/crew/${crew}`))
      );
      crews.value = resAll.map(e => e.data);
    }

    // rocket
    const rocket = ref(null);
    const getRocket = async () => {
      const res = await apis.get(`/rockets/${launch.value.rocket}`);
      rocket.value = res.data;
    };

    const launchpad = ref(null);

    const getLaunchPad = async () => {
      const res = await apis.get(`/launchpads/${launch.value.launchpad}`);
      launchpad.value = res.data;
    };

    onMounted(() => {
      getCrew();
      getRocket();
      getLaunchPad();
    });

    const getDate = date =>
      new Date(date).toString().replace("GMT+0700 (Indochina Time)", "");
    return {
      rocket,
      crews,
      launchpad,
      getDate
    };
  }
});
</script>

<style scoped>
.launch-details > section {
  @apply py-5;
}
.heading {
  @apply bg-indigo-700 text-white rounded-full px-5 inline-block mb-2;
}
</style>
