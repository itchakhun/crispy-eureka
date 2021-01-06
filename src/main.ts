import "./plugins/axios";
import { createApp } from "vue";
import App from "./App.vue";
import Oruga from "@oruga-ui/oruga-next";
import "@oruga-ui/oruga-next/dist/oruga.css";
import "@oruga-ui/oruga-next/dist/oruga-vars.css";

import "./styles.css";
import "./styles.scss";

createApp(App)
  .use(Oruga)
  .mount("#app");
