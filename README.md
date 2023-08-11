# alternator

rollup-plugin directory structure to router tree

## how to use

```javascript
// rollup.config.js
import AlternatorPlugin from "./plugin/AlternatorPlugin";

export default {
  plugins: [
    //...
    AlternatorPlugin({
      routerDir: "src/pages", // required 要转换的页面目录
      ext: ".jsx", // required 文件后缀 
      injectFile: "src/main.jsx", // required 从那个文件注入全局对象
      injectName: "__routes", // 全局对象名称 default:__routes
      separateFile: ["sign-up.jsx", "sign-in.jsx"], // 需要独立路由层级的页面将生成节点 default:[]
      notFound: "_notFound", // 404 page default:`_notFound${ext}`
      layout: "_layout.jsx", // page layout default:`_layout${ext}`
    }),
  ],
  //...
};
```
## react-router example

```jsx
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import lazy from '@/helper/lazy.hoc'; // your lazy hoc
import './main.css';

const createRouter = (router) => {
  const { path, element } = router;
  const Element = element && lazy(element);
  return {
    path,
    element: element && <Element />,
    children: router.children?.map((child) => createRouter(child)),
  };
};

const routes = __routes.map(createRouter);

ReactDOM.createRoot(document.getElementById('root'))
  .render(
    <ErrorBoundary>
      <RouterProvider router={createBrowserRouter(routes)} />
    </ErrorBoundary>,
  );

```

## directory structure to router tree

```
// directory structure
src
├── pages
│   ├── dashboard
│   │   ├──_layout.jsx
│   │   └── index.jsx
│   ├── user
│   │   ├── [id].jsx
│   │   ├── [id].edit.jsx
│   │   ├── create.jsx
│   │   └── index.jsx
│   ├──_layout.jsx
│   ├──_notFound.jsx
│   ├──index.jsx
│   ├──sign-up.jsx
│   └──sign-in.jsx
├── main.css
└── main.jsx
```

```JSON
[
  {
    "path": "/sign-up",
    "element": "/sign-up.jsx"
  },
  {
    "path": "/sign-in",
    "element": "/sign-in.jsx"
  },
  {
    "path": "/",
    "element": "/_layout.jsx",
    "children": [
      {
        "path": "*",
        "element": "/_notFound.jsx"
      },
      {
        "path": "/",
        "element": "/index.jsx"
      },
      {
        "path": "/dashboard",
        "element": "/dashboard/_layout.jsx",
        "children": [
          {
            "path": "/dashboard",
            "element": "/dashboard/index.jsx"
          }
        ]
      }
      {
        "path": "/user",
        "children": [
          {
            "path": "/user/:id",
            "element": "/user/[id].jsx"
          },
          {
            "path": "/user/:id/edit",
            "element": "/user/[id].edit.jsx"
          },
          {
            "path": "/user/create",
            "element": "/user/create.jsx"
          },
          {
            "path": "/user",
            "element": "/user/index.jsx"
          }
        ]
      }
    ]
  }
]
```
