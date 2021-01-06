<template>
  <ul>
    <li v-for="item in result" :key="item.key">
      {{ item }}
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    result: Array
  }
};
</script>

<style></style>
