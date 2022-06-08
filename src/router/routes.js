const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Index.vue") }],
  },
  {
    path: "/NewCharacter",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/NewCharacter.vue") }],
  },
  {
    path: "/Gorthor",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Gorthor.vue") }],
  },
  {
    path: "/Frey",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Frey.vue") }],
  },
  {
    path: "/Sareah",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Sareah.vue") }],
  },
  {
    path: "/Immogen",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Immogen.vue") }],
  },
  {
    path: "/Gub",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Gub.vue") }],
  },
  {
    path: "/NewSearch",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/NewSearch.vue") }],
  },
  {
    path: "/Rub",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Rub.vue") }],
  },
  {
    path: "/Tub",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Tub.vue") }],
  },
  {
    path: "/Bub",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Bub.vue") }],
  },
  {
    path: "/Dominic",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Dominic.vue") }],
  },
  {
    path: "/JacoBard",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/JacoBard.vue") }],
  },
  {
    path: "/Immogen4",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/SelectCharacter.vue") }],
  },
  {
    path: "/Ainsel",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Ainsel.vue") }],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
