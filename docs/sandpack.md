# Sandpack Ultimate Documentation

> 包含了 Sandpack 的所有核心、进阶、指南及架构文档。用于 AI 上下文增强。



--- 
## 📘 章节: Live coding in the browser.
**原文地址:** https://sandpack.codesandbox.io/docs

# Live coding in the browser.

## Run any JavaScript and Node.js app in any browser.

console.log("Sandpack 📦")

export default function App() {
  return (
    <div className\="App"\>
      <h1\>Hello world ✨</h1\>
      <p\>Start editing to see some magic happen!</p\>
    </div\>
  );
}

Open browser console[Open on CodeSandboxOpen Sandbox](https://codesandbox.io/api/v1/sandboxes/define?undefined&environment=create-react-app "Open in CodeSandbox")

Clean

Sandpack is a component toolkit for creating live-running code editing experiences, powered by the online bundler used on [CodeSandbox](https://codesandbox.io/).

It provides an open ecosystem of components and utilities that allow you to compile and run modern frameworks in the browser. You can either use one of our predefined components for embedding the _CodeSandbox_ experience into your projects, or you can build your own version of sandpack, on top of our standard components and utilities.

As you walk through this guide, you will get deeper into our ecosystem.

### Getting Started[](#getting-started)

[

### Install

Learn how to add Sandpack to your projects and start coding in record time.

](/docs/getting-started)[

### Components

Explore all Sandpack capabilities, such as console, tests and preview components.

](/docs/advanced-usage/components)[

### Advanced Usage

Get an overview of some Sandpack capabilities and how to extend its API.

](/docs/advanced-usage/provider)[

### Sandpack Theme Builder

Design and customize your own theme and find other Sandpack presets.

](https://sandpack.codesandbox.io/theme)

[Install](/docs/getting-started "Install")


--- 
## 📘 章节: Install
**原文地址:** https://sandpack.codesandbox.io/docs/getting-started

# Install

Install the Sandpack dependency on your project.

npmyarnpnpm

```
npm i @codesandbox/sandpack-react
```

All the components and the bundler are packed inside the Sandpack component, which is a named export of the package. Besides that, the package contains multiple **components**, **utilities** and **typings**.

## Quickstart[](#quickstart)

This should give you a nice code editor with a preview that runs in the browser.

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return <Sandpack />
}

Preview

  
  

## CDN[](#cdn)

To use Sandpack with CDN, simply include the Sandpack tag in your HTML file and specify the CDN imports inluding Sandpack and its dependencies.

  

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
 
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/[email protected]",
          "react-dom": "https://esm.sh/[email protected]",
          "react-dom/": "https://esm.sh/[email protected]/",
          "@codesandbox/sandpack-react": "https://esm.sh/@codesandbox/[email protected]"
        }
      }
    </script>
 
    <script type="module">
      import React from "react";
      import { createRoot } from "react-dom/client";
      import { Sandpack } from "@codesandbox/sandpack-react";
 
      const root = createRoot(document.getElementById("root"));
      const sandpackComponent = React.createElement(
        Sandpack,
        { template: "react" },
        null
      );
      root.render(sandpackComponent);
    </script>
  </head>
 
  <body>
    <div id="root"></div>
  </body>
</html>
```

## Next steps[](#next-steps)

[

### Templates & files

Learn how to add files to your projects and start coding in record time.

](/docs/getting-started/usage)[

### Themes

Design and customize your own theme and find other Sandpack presets.

](/docs/getting-started/themes)

[Introduction](/docs "Introduction")[Usage](/docs/getting-started/usage "Usage")


--- 
## 📘 章节: Sandpack quickstart
**原文地址:** https://sandpack.codesandbox.io/docs/quickstart

# Sandpack quickstart

With Sandpack, you can easily create interactive components and test your code in real-time, without leaving your browser. Whether you are a beginner or an experienced developer, you will find Sandpack a valuable and fun tool to use.

  

##### 1\. Install[](#1-install)

Install the Sandpack dependency on your project.

npmyarnpnpm

```
npm i @codesandbox/sandpack-react
```

##### 2\. Theme

A theme is a set of visual styles and design elements that can be applied to your project, such as colors, fonts, and layout. This allows you to easily customize the look and feel of your project, without having to manually edit the CSS and HTML. [More about custom themes \->](/docs/getting-started/themes)

autodarklightamethystaquaBlueatomDarkcobalt2cyberpunkdraculaecoLightfreeCodeCampDarkgithubLightgruvboxDarkgruvboxLightlevelUpmonokaiProneoCyannightOwlsandpackDark

[See preview ↓](/docs/quickstart#preview)

  

##### 3\. Template

A template is a pre-defined structure for your project, which includes basic HTML, CSS, and JavaScript files. This allows you to quickly set up a project with a basic structure and styling, without having to start from scratch. [More about files and templates \->](/docs/getting-started/usage)

![static](/docs/logos/html.svg)static![angular](/docs/logos/angular.svg)angular![react](/docs/logos/react.svg)react![solid](/docs/logos/solid.svg)solid![svelte](/docs/logos/svelte.svg)svelte![vanilla](/docs/logos/js.svg)vanilla![vue](/docs/logos/vue.svg)vue

[See preview ↓](/docs/quickstart#preview)

  

##### 4\. Layout

A layout refers to the arrangement of elements on the page, such as the positioning of text and images. This allows you to create a visually appealing and user-friendly design for your project, and can include elements such as grids and columns. [More about layout and components \->](/docs/advanced-usage/components)

DefaultAdvancedCustom heightReverseFile explorerConsole (tab)Console (component)Editor + ConsoleTranspiled codeMultiple previewsMultiple editorsOnly preview

[See preview ↓](/docs/quickstart#preview)

### Preview

This is where you can see your component in action and test it in real-time. You can make changes to your code and see the results immediately.

  

export default function App() {
  return <h1\>Hello world</h1\>
}

[Open on CodeSandboxOpen Sandbox](https://codesandbox.io/api/v1/sandboxes/define?undefined&environment=create-react-app "Open in CodeSandbox")

  

##### Code snippet

  

```
import { Sandpack } from "@codesandbox/sandpack-react";

const App = () => {
  const files = {}
  
  return (
    <Sandpack
      files={files} 
      theme="light" 
      template="react"
    />
  )  
}
```


--- 
## 📘 章节: Usage
**原文地址:** https://sandpack.codesandbox.io/docs/getting-started/usage

# Usage

  
![](/docs/frameworks.jpg)

The Sandpack component you used in the previous section is called a preset. It wraps all the individual components and provides sensible defaults. Presets make it easy to adopt Sandpack, while offering extensive configurability. The first thing we will look at is how to configure the content that runs inside Sandpack.

## Templates[](#templates)

By default your <Sandpack /> instance starts with a predefined template. Each template contains all the files and dependencies needed to start a project. For instance, the vue template will contain the starter files generated by the vue-cli, and the react template those generated by create-react-app.

### Try it out:

![static](/docs/logos/html.svg)static![angular](/docs/logos/angular.svg)angular![react](/docs/logos/react.svg)react![solid](/docs/logos/solid.svg)solid![svelte](/docs/logos/svelte.svg)svelte![vanilla](/docs/logos/js.svg)vanilla![vue](/docs/logos/vue.svg)vue

  

```
import { Sandpack } from "@codesandbox/sandpack-react"

<Sandpack template="react" />
```

  

export default function App() {
  return <h1\>Hello world</h1\>
}

[Open on CodeSandboxOpen Sandbox](https://codesandbox.io/api/v1/sandboxes/define?undefined&environment=create-react-app "Open in CodeSandbox")

The template property accepts a [defined preset list](https://github.com/codesandbox/sandpack/blob/main/sandpack-client/src/types.ts#L384). If the property is not passed, vanilla will be set by default.

## Files[](#files)

Once you've chosen your starter template, you will most likely want to pass custom code into your Sandpack instance. The simplest way to do this, is to add and override files via the files prop.

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return (
    <Sandpack 
      template\="react"
      files\={{
        "/App.js": \`export default function App() {
  return <h1>Hello Sandpack</h1>
}\`,
      }}
    />
  );
}

Preview

  
  

The files prop accepts an object, where each key is the **relative path** of that file in the sandbox folder structure. Files passed in through the files prop override those in the template structure. Since each template uses the same type to define the files, you can overwrite the contents of any of the template files.

Keep in mind that the tabs only show the name of the file and not the full path. For instance, if you want to overwrite /index.js in the vanilla template, you need to specify /src/index.js as the corresponding key in the files object. You can check the full paths for each of the templates in the [template definitions](https://github.com/codesandbox/sandpack/tree/main/sandpack-react/src/templates).

**Available Files**  
Notice that when passing the files prop, only the content you pass there is available in the file tabs. The other files in the template are still bundled together, but you don't see them anymore.

### File format[](#file-format)

The files prop accepts two formats of object, string or another object, where you can pass other configurations for the file.

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return (
    <Sandpack
      files\={{
        '/Wrapper.js': \`export default () => "";\`,
      
        '/Button.js': {
          code: \`export default () => {
  return <button>Hello</button>
};\`,
          readOnly: true, // Set as non-editable, defaults to \`false\`
          active: true, // Set as main file, defaults to \`false\`
          hidden: false // Tab visibility, defaults to \`false\`
        }
      }}
      template\="react"
    />
  )
};

Preview

  
  

If no active flag is set, the first file will be active by default:

The active flag has precendence over the hidden flag. So a file with both hidden and active set as true will be visible.

## Dependencies[](#dependencies)

Any template will include the needed dependencies, but you can specify any additional dependencies.

### NPM Dependencies[](#npm-dependencies)

Inside customSetup prop you can pass a dependencies object. The key should be the name of the package, while the value is the version, in exactly the same format as it would be inside package.json.

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return (
    <Sandpack
      template\="react"
      customSetup\={{ 
        dependencies: { 
          "react-markdown": "latest" 
        }
      }}
      files\={{
        "/App.js": \`import ReactMarkdown from 'react-markdown' 

export default function App() {
  return (
    <ReactMarkdown>
      # Hello, \*world\*!
    </ReactMarkdown>
  )
}\`
      }}
    />
  )
};

Preview

  
  

### Static External Resources[](#static-external-resources)

You can also pass an array of externalResources into the options prop to specify static links to external CSS or JS resources elsewhere on the web. These resources get injected into the head of your HTML and are then globally available. Here's an example using the Tailwind CSS CDN:

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return (
    <Sandpack
      template\="react"
      options\={{
        externalResources: \["https://cdn.tailwindcss.com"\]
      }}
      files\={{
        "/App.js": \`export default function Example() {
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          <span className="block">Ready to dive in?</span>
          <span className="block text-indigo-600">Start your free trial today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700"
            >
              Get started
            </a>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}\`
      }}
    />
  );
}

Preview

  
  

## Advanced Usage[](#advanced-usage)

### Read-only mode[](#read-only-mode)

You can set one, multiple files, or the entire Sandpack as read-only, which will make all files non-editable.

**Per file:**

```
<Sandpack
  files={{
    "/App.js": reactCode,
    "/button.js": {
      code: buttonCode,
      readOnly: true,
    },
  }}
  template="react"
/>
```

**Globally:**

```
<Sandpack
  options={{
    readOnly: true,
  }}
/>
```

Plus, you can hide the Read-only label which appears on top of the code editor:

```
<Sandpack
  options={{
    readOnly: true,
    showReadOnly: false,
  }}
/>
```

### visibleFiles and activeFile[](#visiblefiles-and-activefile)

You can override the entire hidden/active system with two settings (visibleFiles and activeFile) inside the options prop.

Notice that both options require you to match the exact file paths inside the sandbox, so use with caution as this can quite easily create errors in the long term.

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default () \=> {
  return (
    <Sandpack
      template\="react"
      files\={{ "/button.js": \`export default () => <button />\` }}
      options\={{
        visibleFiles: \["/App.js", "/button.js", "/index.js"\],
        activeFile: "/button.js",
      }}
    />
  )
}

Preview

  
  

When visibleFiles or activeFile are set, the hidden and active flags on the files prop are ignored.

### Custom Entry File[](#custom-entry-file)

Additionally, you can also specify a different entry file for the sandbox. The entry file is the starting point of the bundle process.

```
<Sandpack
  template="react"
  files={{
    "/App.js": `...`,
  }}
  customSetup={{
    entry: "/index.js",
  }}
/>
```

⚠️

If you change the path of the entry file, make sure you control all the files that go into the bundle process, as prexisting settings in the template might not work anymore.

### Fully Custom Setup[](#fully-custom-setup)

Sometimes you might not want to start from any of the preset templates. If so, you can pass a full customSetup object that contains everything needed for your custom Sandpack configuration.

[Install](/docs/getting-started "Install")[Layout](/docs/getting-started/layout "Layout")


--- 
## 📘 章节: Layout
**原文地址:** https://sandpack.codesandbox.io/docs/getting-started/layout

# Layout

  
![](/docs/layout.jpg)

In this next section, you can read about all the different options for customizing the UI of the Sandpack components that render inside the <Sandpack /> preset.

## Styling[](#styling)

Theming controls the color palette and typography, but you can also append your own custom style to existing Sandpack components.

For this, sandpack uses a small package called [classer](https://github.com/code-hike/codehike/blob/next/packages/mdx/src/classer/index.tsx). To customize existing components, you need to map your own classes to the internal sandpack classes. So, while inspecting your Sandpack instance, notice that our components have classes prefixed with sp-.

```
<Sandpack
  theme={theme}
  template="react"
  options={{
    classes: {
      "sp-wrapper": "custom-wrapper",
      "sp-layout": "custom-layout",
      "sp-tab-button": "custom-tab",
    },
  }}
/>
```

💡

This pattern is compatible with most modern styling systems, including Tailwind, styled-components and emotion.

### Bare components, remove runtime styling or use unstyled components[](#bare-components-remove-runtime-styling-or-use-unstyled-components)

@codesanbdox/sandpack-react relies on [@stitches/core](https://github.com/stitchesjs/stitches) to style its component, which is almost zero-runtime CSS-in-JS framework. However, if you want to get rid of any runtime script or create your own style on top of Sandpack components, we provide a way to return unstyled components, which will eliminate all Sandpack CSS style.

To do it, you need to consume the same components from the unstyled subfolder, which doesn't contain the Stitches dependency. For example:

```
import { Sandpack } from "@codesandbox/sandpack-react/unstyled";
 
const App = () => {
  return <Sandpack />
};
```

## Themes[](#themes)

The overall style can be set through the theme prop. Sandpack offers a set of predefined options, but individual values can be passed to customize the style of your Sandpack instance. Access the links below to see all themes and learn how to customize them.

[

### All themes

See all themes available on @codesandbox/sandpack-themes and how you can use it

](/docs/themes#all-themes)[

### Sandpack Theme Builder

Design and customize your own theme, among other Sandpack presets.

](https://sandpack.codesandbox.io/theme)

## Options[](#options)

Some of the internal components of Sandpack can be configured via the options prop.

### Layout mode[](#layout-mode)

The Sandpack preset component offers three layout modes:

*   preview: (default option) which renders an iframe as a preview component;
*   tests: which renders a suit-test component;
*   console: which renders a terminal/console component instead of the preview.

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return (
    <Sandpack 
      template\="node"
      options\={{
        layout: "console", // preview | tests | console
      }}
    />
  );
}

Preview

  
  

### Navigator[](#navigator)

By default <Sandpack /> will show a refresh button in the lower part of the preview. Using showNavigator you can toggle on a full browser navigator component with: back, forward and refresh buttons as well as an input for the URL.

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return (
    <Sandpack 
      template\="react"
      options\={{
        showNavigator: true,
      }}
    />
  );
}

Preview

  
  

### Tabs[](#tabs)

File tabs are shown if more than one file is open. But you can force tabs to always be shown/hidden with the showTabs prop. On top of that, the closableTabs prop allows you to add a small close button for each tab, which removes it from the list.

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return (
    <Sandpack 
      template\="react"
      options\={{
        showTabs: true,
        closableTabs: true,
      }}
    />
  );
}

Preview

  
  

### Editor Settings[](#editor-settings)

There are a few different props for the code editor. showLineNumbers and showInlineErrors will toggle on/off some of the elements of the editor component. By default, line numbers are shown, but errors are not highlighted inline.

One useful configuration is the height of the component. We recommend **fixed heights**, to avoid any layout shift while the bundler is running or as you type in the editor or switch the tab. By default, the height is set to 300px, but you can adjust that with the editorHeight prop.

Finally, you can specify the distribution between the width of the editor and that of the preview. The <SandpackLayout /> component arranges the two in a flex layout, distributing the space between the editor and the preview according to this prop. A value of 60 for the editorWidthPercentage will mean the Preview gets 40% of the space.

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return (
    <Sandpack 
      template\="react"
      options\={{
        showLineNumbers: false, // default - true
        showInlineErrors: true, // default - false
        wrapContent: true, // default - false
        editorHeight: 280, // default - 300
        editorWidthPercentage: 60, // default - 50
      }}
    />
  );
}

Preview

  
  

### Autorun & auto reload[](#autorun--auto-reload)

**autorun**

Determines whether or not the bundling process should start automatically for a component in Sandpack. By default, when the component gets closer to the viewport or when the page loads and the component is already in the viewport, the bundling process will start automatically. However, if this prop is set to false, the bundling process will only start when triggered manually by the user.

**autoReload**

Determines whether or not the component should automatically reload when changes are made to the code. When this prop is set to true, any changes made to the code will trigger an automatic reload of the component, allowing the user to see the changes immediately. However, if this prop is set to false, the component will need to be manually reloaded by the user to see the changes.

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return (
    <Sandpack 
      template\="react"
      options\={{
        autorun: false,
        autoReload: false
      }}
    />
  );
}

Preview

  
  

#### Init mode[](#init-mode)

The initMode prop provides a way to control how some components are going to be initialized on the page. For example, <SandpackCodeEditor /> and the <SandpackPreview /> components are quite expensive and might overload memory usage, giving a certain control of when to initialize them.

*   immediate: loads right after the Sandpack instance is created;
*   lazy: loads when the Sandpack instance is close to the viewport and keeps it running (this's the default value);
*   user-visible: loads when the Sandpack instance is close to the viewport, but different from lazy, it destroys all instances when it's out of the viewport and mounts again when it's close to the viewport;

```
<Sandpack
  options={{
    initMode: "user-visible",
    initModeObserverOptions: { rootMargin: `1000px 0px` } // `IntersectionObserverInit` options
  }}
  template="react"
/>
```

### Recompile Mode[](#recompile-mode)

The recompileMode option also allows you configure what happens when the user starts typing in the code editor. The immediate mode will fire the change to the bundler as soon as it is received, while the delayed mode will debounce the bundler operation until the user starts typing. Optionally, you can set the delay for the debounce, which by default is 500ms.

By default, the mode is set to delayed to ensures the bundler doesn't run on each keystroke. You can customize this experience by modifying the recompileDelay value or by setting the recompileMode to immediate.

```
<Sandpack
  options={{
    recompileMode: "delayed",
    recompileDelay: 300,
  }}
  template="react"
/>
```

### Resizable panels[](#resizable-panels)

The <Sandpack /> preset component has resizable columns and rows by default, allowing users to extend and shrink the component sizes. This makes it easier to play with the preview component and shows more code-editor content. However, this is an optional configuration, and you can easily disable it:

```
<Sandpack options={{ resizablePanels: false }} />
```

Other components (SandpackProvider for example) do not have this functionality and it must be implemented by the user.

### Right to left layout[](#right-to-left-layout)

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";
export default function App() {
  return (
    <Sandpack 
      options\={{
        rtl: true, // default false
      }}
    />
  );
}

Preview

  
  

[Usage](/docs/getting-started/usage "Usage")[Themes](/docs/getting-started/themes "Themes")


--- 
## 📘 章节: Sandpack Themes
**原文地址:** https://sandpack.codesandbox.io/docs/getting-started/themes

# Sandpack Themes

  
![](/docs/themes.jpg)

[

### All themes

See all themes available on @codesandbox/sandpack-themes and how you can use it

](#all-themes)[

### Sandpack Theme Builder

Design and customize your own theme, among other Sandpack presets.

](https://sandpack.codesandbox.io/theme)

The overall style can be set through the theme prop. Sandpack offers a set of predefined options, but individual values can be passed to customize the style of your Sandpack instance. Besides the included themes, you can also consume a set of themes from @codesandbox/sandpack-themes, an open-source package that contains many other themes compatible with Sandpack.

### Try it out (17 total):

autodarklightamethystaquaBlueatomDarkcobalt2cyberpunkdraculaecoLightfreeCodeCampDarkgithubLightgruvboxDarkgruvboxLightlevelUpmonokaiProneoCyannightOwlsandpackDark

  

```
import { amethyst } from "@codesandbox/sandpack-themes";
    
<Sandpack theme={amethyst} />;
```

  

App.jsClose file

index.jsClose file

index.htmlClose file

styles.cssClose file

export default function App() {
  return <h1\>Hello world</h1\>
}

Click to go backClick to go forwardRefresh preview

[Open on CodeSandboxOpen Sandbox](https://codesandbox.io/api/v1/sandboxes/define?undefined&environment=create-react-app "Open in CodeSandbox")

## Custom Theme[](#custom-theme)

You can also pass a **partial** theme object that overrides properties in the **default** theme, which is light.

  

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default function App() {
  return (
    <Sandpack 
      theme\={{
        colors: {
          accent: "rebeccapurple",
        },
        syntax: {
          tag: "#006400",
          string: "rgb(255, 165, 0)",
          plain: "tomato",
        },
      }}
    />
  );
}

Preview

  
  

[Layout](/docs/getting-started/layout "Layout")[Private packages](/docs/getting-started/private-packages "Private packages")


--- 
## 📘 章节: Overview
**原文地址:** https://sandpack.codesandbox.io/docs/advanced-usage

# Overview

If you [open a preset file](https://github.com/codesandbox/sandpack/blob/main/sandpack-react/src/presets/Sandpack.tsx) from the sandpack repository, you'll see it is made up of smaller sandpack **components** and has limited logic for passing props to those smaller components.

If you need a custom version of sandpack, you can opt in to use these smaller components, which are also exported from the main package.

Before talking about the actual components, let's dive into how sandpack manages its internal state.

## Sandpack Provider[](#sandpack-provider)

The core of sandpack is managed by the SandpackProvider, central point of our architecture. The provider abstracts the functionality of sandpack and places the public state values and functions on a context object. The React components that are exported by the main package (eg: SandpackCodeEditor, SandpackPreview) use that context object to communicate with sandpack.

Editable example

import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackPreview, 
  SandpackCodeEditor 
} from "@codesandbox/sandpack-react";

const CustomSandpack = () \=> (

<SandpackProvider template\="vanilla" theme\="auto"\>
  <SandpackLayout\>
    <SandpackCodeEditor />
    <SandpackPreview />
  </SandpackLayout\>
</SandpackProvider\>
);

export default () \=> <CustomSandpack />

Preview

  
  

Running this snippet will render a preview with a vanilla template, because the sandpack logic is running behind the scenes and the template, if omitted, is vanilla.

### Clients[](#clients)

Under one Sandpack provider, you can have multiple sandpack-clients. For example, the most common case for multiple clients is when more than one SandpackPreview has been rendered.

To access all the clients or to pass messages to the iframes under the same provider, use the useSandpack hook, which gives a way to interact with these clients:

```
const ListenerIframeMessage = () => {
  const { sandpack } = useSandpack();
 
  const sender = () => {
    Object.values(sandpack.clients).forEach((client) => {
      client.iframe.contentWindow.postMessage("Hello world", "*");
    });
  };
 
  return <button onClick={sender}>Send message</button>;
};
```

[Private packages](/docs/getting-started/private-packages "Private packages")[Components](/docs/advanced-usage/components "Components")


--- 
## 📘 章节: Components
**原文地址:** https://sandpack.codesandbox.io/docs/advanced-usage/components

# Components

  
![](/docs/components.jpg)

Several Sandpack prefixed components are available in the sandpack-react package. They can be used to build custom presets, as long as they render within the providers we talked about during the previous section.

Let's try to rebuild the Sandpack preset, using the sandpack components available in the sandpack-react package.

## Layout[](#layout)

The first component inside the Provider is SandpackLayout. This component ensures the theming is applied and gives your sandpack instance the two column layout with the first child on the left and the second one on the right.

💡

SandpackLayout gives you the left-right split between two components and also breaks the columns when the component is under 700px wide, so you have some responsiveness built-in. It also renders the theme provider for convenience.

Editable example

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

export default () \=> (
  <SandpackProvider template\="react"\>
    <SandpackLayout\>
      <SandpackCodeEditor />
      <SandpackPreview />
    </SandpackLayout\>
  </SandpackProvider\>
);

Preview

  
  

Further now we have pretty much the same component as the preset, minus the prop passing, which you can decide based on your specific needs.

You can easily swap the two components inside the SandpackLayout to get a different instance of Sandpack.

Editable example

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

export default () \=> (
  <SandpackProvider template\="react"\>
    <SandpackLayout\>
      <SandpackPreview />
      <SandpackCodeEditor />
    </SandpackLayout\>
  </SandpackProvider\>
);

Preview

  
  

SandpackProvider accepts a theme prop, so you can pass in your [custom theme object or a predefined theme](/docs/advanced-usage#sandpack-provider).

## Preview[](#preview)

The Preview component is running the sandpack bundler, so without rendering a Preview component you will not have any bundling and evaluation of the code in sandpack. However, the Preview is smart enough to start even if it is mounted later in the page. This is how the autorun=false mode is working.

```
<SandpackProvider template="react">
  <SandpackLayout>
    <SandpackPreview />
  </SandpackLayout>
</SandpackProvider>
```

There's nothing stopping you from rendering multiple previews in the same Provider. They will all be connected to the same state source, but they can for example point to different pages of the same application.

Editable example

import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

export default () \=> (
  <SandpackProvider template\="react"\>
    <SandpackLayout\>
      <SandpackPreview />
      <SandpackPreview />
      <SandpackPreview />
      <SandpackPreview />
    </SandpackLayout\>
  </SandpackProvider\>
);

Preview

  
  

Options

Prop

Description

Type

Default

showNavigator

boolean

false

showOpenInCodeSandbox

boolean

true

showRefreshButton

boolean

true

showSandpackErrorOverlay

Whether to show the <ErrorOverlay> component on top of the preview, if a runtime error happens.

boolean

true

showOpenNewtab

boolean

true

actionsChildren

JSX.Element

null

startRoute

Overwrite the default starting route

string

undefined

### Additional buttons[](#additional-buttons)

The <SandpackPreview /> component also allows you to add additional buttons to the preview area.

Editable example

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

export default () \=> (
  <SandpackProvider template\="react"\>
    <SandpackLayout\>
      <SandpackPreview
        actionsChildren\={
          <button onClick\={() \=> window.alert("Bug reported!")}\>
            Report bug
          </button\>
        }
      />
      <SandpackCodeEditor />
    </SandpackLayout\>
  </SandpackProvider\>
);

Preview

  
  

### Additional content[](#additional-content)

For advanced use cases, children of <SandpackPreview> are rendered at the end of the preview container.

### Getting the client instance from SandpackPreview[](#getting-the-client-instance-from-sandpackpreview)

You can imperatively retrieve the Sandpack client from a SandpackPreview ref, and also consume or interact with the current state of the preview. Check out the [type definitions](/docs/api/react/interfaces/SandpackPreviewRef) for more details.

```
import { SandpackPreviewRef, useSandpack, SandpackPreview } from "@codesandbox/sandpack-react"
 
const SandpackPreviewClient: React.FC = () => {
  const { sandpack } = useSandpack();
  const previewRef = React.useRef<SandpackPreviewRef>();
 
  React.useEffect(() => {
    const client = previewRef.current?.getClient();
    const clientId = previewRef.current?.clientId;
 
    if (client && clientId) {
      console.log(client);
      console.log(sandpack.clients[clientId]);
    }
  /**
   * NOTE: In order to make sure that the client will be available
   * use the whole `sandpack` object as a dependency.
   */
  }, [sandpack]);
 
  return <SandpackPreview ref={previewRef} />;
};
```

💡

Worth mentioning that the SandpackClient will not be instantly available. Sandpack has its own rules to decide when it'is the "right" moment to initialize an instance from a preview component. (Sandpack will take into account properties such as autorun, initMode, and the current client stack priority) This means that it's expected that getClient function returns undefined which is a valid state.

## Code editor[](#code-editor)

The SandpackCodeEditor component renders a wrapper over [codemirror](https://github.com/codemirror/codemirror.next), a lightweight code editor we use inside sandpack. If you played with the Sandpack preset, you should be familiar already with the props that you can pass to the code editor component:

Editable example

import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";

export default () \=> (
  <SandpackProvider template\="react"\>
    <SandpackLayout\>
      <SandpackCodeEditor
        showTabs
        showLineNumbers\={false}
        showInlineErrors
        wrapContent
        closableTabs
      />
      <SandpackPreview />
    </SandpackLayout\>
  </SandpackProvider\>
);

Preview

  
  

Options

Prop

Description

Type

Default

showTabs

boolean

false

showLineNumbers

boolean

false

showInlineErrors

boolean

false

showRunButton

boolean

false

wrapContent

boolean

false

closableTabs

boolean

false

initMode

This provides a way to control how some components are going to be initialized on the page. The CodeEditor and the Preview components are quite expensive and might overload the memory usage, so this gives a certain control of when to initialize them.

"immediate" | "lazy" | "user-visible"

"lazy"

extensions

CodeMirror extensions for the editor state, which can provide extra features and functionalities to the editor component.

Extension\[\]

undefined

extensionsKeymap

Property to register CodeMirror extension keymap.

KeyBinding\[\]

\`undefined

id

By default, Sandpack generates a random value to use as an id. Use this to override this value if you need predictable values.

string

undefined

readOnly

This disables editing of the editor content by the user.

boolean

false

showReadOnly

Controls the visibility of Read-only label, which will only appears when readOnly is true

boolean

true

additionalLanguages

Provides a way to add custom language modes by supplying a language type, applicable file extensions, and a LanguageSupport instance for that syntax mode

CustomLanguage\[\]

undefined

### Extensions[](#extensions)

Sandpack uses CodeMirror under the hood to provide a nice editor. You can extend the editor with any CodeMirror extensions, such as [@codemirror/autocomplete](https://www.npmjs.com/package/@codemirror/autocomplete).

Editable example

import { 
  Sandpack, 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor 
} from "@codesandbox/sandpack-react";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";

export default () \=> (
  <SandpackProvider template\="react"\>
    <SandpackLayout\>
      <SandpackCodeEditor
        extensions\={\[autocompletion()\]}
        extensionsKeymap\={\[completionKeymap\]}
      />
    </SandpackLayout\> 
  </SandpackProvider\>
);

Preview

  
  

### Additional languages[](#additional-languages)

Sandpack provides built-in support for a variety of common languages:

*   JavaScript, JSX
*   TypeScript, TSX
*   CSS, SCSS, Less
*   HTML
*   Vue

When an appropriate language can't be detected JavaScript is used.

If you want to support additional languages you can extend the editor by supplying a [CodeMirror language](https://github.com/orgs/codemirror/repositories?q=language&type=source) and associating it with one or more file extensions.

```
import { python } from "@codemirror/lang-python";
 
<SandpackProvider>
  <SandpackCodeEditor
    additionalLanguages={[
      {
        name: "python",
        extensions: ["py"],
        language: python(),
      },
    ]}
  />
</SandpackProvider>
 
<Sandpack
  options={{
    codeEditor: {
      additionalLanguages: [
        {
          name: "python",
          extensions: ["py"],
          language: python(),
        },
      ]
    },
  }}
  template="react"

```

When using a [stream language mode](https://www.npmjs.com/package/@codemirror/legacy-modes) you'll need to convert it into a LanguageSupport instance.

```
import { LanguageSupport, StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
 
<SandpackProvider>
  <SandpackCodeEditor
    additionalLanguages={[
      {
        name: "shell",
        extensions: ["sh", "bat", "ps1"],
        language: new LanguageSupport(StreamLanguage.define(shell)),
      },
    ]}
  />
</SandpackProvider>;
```

### Advanced usage[](#advanced-usage)

If you want to interact directly with CodeMirror, use the component ref to access the getCodemirror function, which will return the CodeMirror instance. Check out how to use it:

```
import { EditorSelection } from "@codemirror/state";
 
const App = () => {
  const codemirrorInstance = useRef();
 
  useEffect(() => {
    // Getting CodeMirror instance
    const cmInstance = codemirrorInstance.current.getCodemirror();
 
    if (!cmInstance) return;
 
    // Current position
    const currentPosition = cmInstance.state.selection.ranges[0].to;
 
    // Setting a new position
    const trans = cmInstance.state.update({
      selection: EditorSelection.cursor(currentPosition + 1),
      changes: {
        from: 0,
        to: cmInstance.state.doc.length,
        insert: code,
      },
    });
 
    cmInstance.update([trans]);
  }, []);
 
  return (
    <SandpackProvider template="react">
      <SandpackCodeEditor ref={codemirrorInstance} />
    </SandpackProvider>
  );
};
```

This is especially useful to get the cursor's current position, add custom decorators, set the selection in a specific position, etc.

## File Explorer[](#file-explorer)

The SandpackFileExplorer provides a minimal but very powerful experience to navigate through files. You can open and close folders, and open new files.

Editable example

import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackFileExplorer 
} from "@codesandbox/sandpack-react";

export default () \=> (
  <SandpackProvider template\="react"\>
    <SandpackLayout\>
      <SandpackFileExplorer />
      <SandpackCodeEditor />
    </SandpackLayout\>
  </SandpackProvider\>
);

Preview

  
  

Options

Prop

Description

Type

Default

autoHiddenFiles

Enable auto hidden file in file explorer

boolean

false

initialCollapsedFolder

Initial state of folder (collapsed or not)

string\[\] e.g. \["/components/src/"\]

undefined

If you're looking for extra feature we recommend using [AaronPowell96/sandpack-file-explorer](https://github.com/AaronPowell96/sandpack-file-explorer) package which support things such as:

*   Add and remove files or directories,
*   Drag and drop to move files or directories,
*   Allow users to customise the entire folder structure right within your website!
*   Works out of the box with all of Sandpack's templates.

## Tests[](#tests)

The SandpackTests component renders a thin wrapper around [Jest](https://jestjs.io/) to run tests directly in the browser. This means you can run tests but additional configuration may not possible given the browser environment.

💡

Any test files ending with .test.js(x), .spec.js(x), .test.ts(x) and .spec.ts(x) will automatically be run with Jest and the results shown in the SandpackTests component.

### Usage[](#usage)

There are two ways to run tests and check out the output:

#### Sandpack Preset[](#sandpack-preset)

Using test-ts template preset, which contains an example test.

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default () \=> <Sandpack template\="test-ts" />;

Preview

  
  

#### SandpackTests component[](#sandpacktests-component)

Standalone and configurable component to run tests, which you can combine with test-ts template or supply custom files. For more details about its usage and implementation, check out the [API reference](/docs/api/react#sandpacktests).

Editable example

import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackTests 
} from "@codesandbox/sandpack-react";

export default () \=> (
  <SandpackProvider template\="test-ts"\>
    <SandpackLayout\>
      <SandpackTests />
      <SandpackCodeEditor />
    </SandpackLayout\>
  </SandpackProvider\>
);

Preview

  
  

Options

Prop

Description

Type

Default

verbose

Display individual test results with the test suite hierarchy.

boolean

false

watchMode

Watch files for changes and rerun all tests. Note if changing a test file then the current file will run on it's own

boolean

true

onComplete

A callback that is invoked with the completed specs.

Function

undefined

### Extending expect[](#extending-expect)

💡

Although not all configuration is supported, [extending expect](https://jestjs.io/docs/expect#expectextendmatchers) with custom / third party matchers is still possible.

Add the matchers either as a dependency or as a file and then import the matchers into your tests and invoke expect.extend with your matchers.

Editable example

import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackTests 
} from "@codesandbox/sandpack-react";

const extendedTest = \`import \* as matchers from 'jest-extended';
import { add } from './add';

expect.extend(matchers);

describe('jest-extended matchers are supported', () => {
test('adding two positive integers yields a positive integer', () => {
expect(add(1, 2)).toBePositive();
});
});
\`;

export default () \=> (
  <SandpackProvider
    customSetup\={{ dependencies: { "jest-extended": "^3.0.2" } }}
    files\={{ "/extended.test.ts": extendedTest }}
    template\="test-ts"
  \>
    <SandpackLayout\>
      <SandpackCodeEditor />
      <SandpackTests />
    </SandpackLayout\>
  </SandpackProvider\>
);

Preview

  
  

### Hiding Tests[](#hiding-tests)

You can hide the test files using the visibleFiles prop. Additionally, if you want to suppress test content and only show the test results, you can use the hideTestsAndSuppressLogs option. This option will hide the test files, suppress the console logs, and disable the verbose button.

Editable example

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackTests,
} from "@codesandbox/sandpack-react";

export default () \=> (
  <SandpackProvider
    template\="test-ts"
    options\={{
      activeFile: "/add.ts",
      visibleFiles: \["/add.ts"\],
    }}
  \>
    <SandpackLayout\>
      <SandpackCodeEditor />
      <SandpackTests hideTestsAndSupressLogs />
    </SandpackLayout\>
  </SandpackProvider\>
);

Preview

  
  

## Console[](#console)

SandpackConsole is a Sandpack devtool that allows printing the console logs from a Sandpack client. It is designed to be a light version of a browser console, which means that it's limited to a set of common use cases you may encounter when coding.

Sandpack runs the console directly into the iframe. As a result, all console messages pass through the Sandpack protocol, where you can attach a listener to these messages in your own component or use the proper Sandpack React hook to consume them.

### Usage[](#usage-1)

There are three ways to print the logs:

*   <Sandpack options={{ showConsole: true }} />: shows a panel right after the SandpackPreview;
*   <SandpackConsole />: standalone component to render the logs;
*   useSandpackConsole: React hook to consume the console logs from a Sandpack client;

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default () \=> (
  <Sandpack
    options\={{
      showConsole: true,
      showConsoleButton: true,
    }}
  />
);

Preview

  
  

SandpackConsole Options

Prop

Description

Type

Default

clientId

string

undefined

showHeader

boolean

true

showSyntaxError

boolean

false

showResetConsoleButton

boolean

true

showRestartButton

boolean

true

maxMessageCount

number

800

onLogsChange

(logs: SandpackConsoleData) => void

resetOnPreviewRestart

Reset the console list on every preview restart

boolean

false

ref

Make possible to imperatively interact with the console component

SandpackConsoleRef

SandpackConsoleRef

standalone

It runs its sandpack-client, meaning it doesn't depend on a SandpackPreview component.

boolean

false

actionsChildren

JSX.Element

null

### Limitation[](#limitation)

Considering that SandpackConsole is meant to be a light version of a browser console, there are a few limitations in its implementation in order to keep it modular and light:

*   It needs to have a Sandpack client running (iframe) to execute the logs.
*   It only supports four types of consoles: info, warning, error, and clear.
*   It doesn't render nested objects due to recursive issues.

However, if you need to support more advanced cases, [useSandpackConsole](/docs/api/react#usesandpackconsole) hook is compatible with [console-feed](https://www.npmjs.com/package/console-feed), which provides a closer browser-console experience without any of the limitations mentioned above.

## Code Viewer[](#code-viewer)

For situations when you strictly want to show some code and run it in the browser, you can use the SandpackCodeViewer component. It looks similar to the code editor, but it renders a read-only version of codemirror, so users will not be able to edit the code.

Editable example

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackCodeViewer,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

export default () \=> (
  <SandpackProvider template\="react"\>
    <SandpackLayout\>
      <SandpackCodeViewer />
      <SandpackPreview />
    </SandpackLayout\>
  </SandpackProvider\>
);

Preview

  
  

Options

Prop

Description

Type

Default

showTabs

boolean

false

showLineNumbers

boolean

false

decorators

Provides a way to draw or style a piece of the content.

Decorators

undefined

code

string

undefined

wrapContent

boolean

false

initMode

This provides a way to control how some components are going to be initialized on the page. The CodeEditor and the Preview components are quite expensive and might overload the memory usage, so this gives a certain control of when to initialize them.

"immediate" | "lazy" | "user-visible"

"lazy"

### CodeMirror decorations[](#codemirror-decorations)

This API provides a way to draw or style a piece of code in the editor content. You can implement it in the following ways:

*   Entire line: add className or elements attributes to an entire line;
*   Range: add className or elements attributes to a piece of content, given a line, startColumn and endColumn;

data.js

index.css

App.js

export default \[
  { className: "highlight", line: 1 },
  { className: "highlight", line: 9 },
  {
    className: "widget",
    elementAttributes: { "data-id": "1" },
    line: 12,
    startColumn: 26,
    endColumn: 38,
  },
  {
    className: "widget",
    elementAttributes: { "data-id": "2" },
    line: 13,
    startColumn: 8,
    endColumn: 17,
  },
\];

[Open on CodeSandboxOpen Sandbox](https://codesandbox.io/api/v1/sandboxes/define?undefined&environment=create-react-app "Open in CodeSandbox")

## OpenInCodeSandboxButton[](#openincodesandboxbutton)

You can build a custom button that creates a new sandbox from the sandpack files. It will include any edits made in the Sandpack editor, so it is a great way to persist your changes. The created sandbox will open on [CodeSandbox](https://codesandbox.io) in a new tab.

Let's use the UnstyledOpenInCodeSandboxButton as an example:

Editable example

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  UnstyledOpenInCodeSandboxButton,
} from "@codesandbox/sandpack-react";

export default () \=> (
  <SandpackProvider template\="react"\>
    <SandpackLayout\>
      <SandpackCodeEditor />
    </SandpackLayout\>
    
    <UnstyledOpenInCodeSandboxButton\>
      Open in CodeSandbox
    </UnstyledOpenInCodeSandboxButton\>
  </SandpackProvider\>
);

Preview

  
  

The UnstyledOpenInCodeSandboxButton is a basic component that does not carry any styles. If you want a ready-to-use component, use the OpenInCodeSandboxButton instead, which has the same functionality but includes the CodeSandbox logo.

## Other components[](#other-components)

You can also bring other components in the mix: SandpackTranspiledCode, FileTabs, SandpackFileExplorer, Navigator and so on.

For example, you can create an editor instance that gives you the transpiled code of your **active** component instead of the preview page:

Editable example

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackTranspiledCode,
} from "@codesandbox/sandpack-react";

export default () \=> (
  <SandpackProvider template\="react"\>
    <SandpackLayout\>
      <SandpackCodeEditor />
      <SandpackTranspiledCode />
    </SandpackLayout\>
  </SandpackProvider\>
)

Preview

  
  

You will notice that the theming applies to all components in the same way, as the theme object is also distributed by the theme context.

Some of the components have configuration props that toggle subparts on/off or that configure behavior/look. All of them comunicate with sandpack through the shared context.

💡

**Congrats!**

  

You can now easily create a custom Sandpack component by reusing some of the building components of the library. The next step is to build your own sandpack components with the help of our custom hooks.

[Overview](/docs/advanced-usage "Overview")[Hooks](/docs/advanced-usage/hooks "Hooks")


--- 
## 📘 章节: Hooks
**原文地址:** https://sandpack.codesandbox.io/docs/advanced-usage/hooks

# Hooks

If you want to build a new component or you want to re-implement the code editor, for example, you can still rely on the sandpack state and create your UI from scratch.

The sandpack-react package exports a set of hooks, that give you access to the sandpack context in your own components.

## useSandpack[](#usesandpack)

The main hook is called useSandpack and gives you the entire context object to play with.

💡

Keep in mind that the useSandpack hook only works inside the <SandpackProvider>.

Let's build a code viewer component that renders a standard pre tag:

```
import { useSandpack } from "@codesandbox/sandpack-react";
 
const SimpleCodeViewer = () => {
  const { sandpack } = useSandpack();
  const { files, activeFile } = sandpack;
 
  const code = files[activeFile].code;
  return <pre>{code}</pre>;
};
```

The sandpack object is available in any component and exposes all the internal state:

*   the files including all the setup/template files
*   the activeFile / visibleFiles fields
*   the error object, if any
*   multiple functions for changing the state of sandpack: updateCurrentFile, setActiveFile, etc.

In the component above, you get the active code string by calling files\[activeFile\].code, so any change of state will trigger a re-render of the component and an update of the code.

We can test this with the CustomSandpack we implemented at the previous step.

```
<SandpackProvider template="react">
  <SandpackLayout>
    <SandpackCodeEditor />
    {/* This will render the pre on the right side of your sandpack component */}
    <SimpleCodeViewer />
  </SandpackLayout>
</SandpackProvider>
```

If you run this, you will notice that the SimpleCodeViewer is in sync with the state of the SandpackCodeEditor.

useSandpack also exports dispatch and listen, you can levarage these functions for communicating directly with the bundler. However, at this point, you'd have understood all the different types of messages and payloads that are passed from the sandpack manager to the iframe and back.

```
import { useSandpack } from "@codesandbox/sandpack-react";
 
const CustomRefreshButton = () => {
  const { dispatch, listen } = useSandpack();
 
  const handleRefresh = () => {
    // sends the refresh message to the bundler, should be logged by the listener
    dispatch({ type: "refresh" });
  };
 
  useEffect(() => {
    // listens for any message dispatched between sandpack and the bundler
    const stopListening = listen((msg) => console.log(msg));
 
    return () => {
      // unsubscribe
      stopListening();
    };
  }, [listen]);
 
  return (
    <button type="button" onClick={handleRefresh}>
      Refresh
    </button>
  );
};
```

Plus, useSandpack exposes a bunch of methods that you can use to manage the current state of the Sandpack instance:

Method

Description

closeFile

Close the given path in the editor

deleteFile

Delete the given path in the editor

dispatch

Sends a message to the bundler

listen

Listens for messages from the bundler

openFile

Open the given path in the editor

resetAllFiles

Reset all files for all paths to the original state

resetFile

Reset the code for a given path

setActiveFile

Set a specific file as active in a given path

updateFile

Update the content of a file in a given path or multiple files

updateCurrentFile

Update the content of the current file

## useSandpackNavigation[](#usesandpacknavigation)

Some of the common functionalities of sandpack are also extracted into specialized hooks. These all use useSandpack under the hood, but abstract away the shape of the **state** object and the **dispatch/listen** functions.

The refresh button can be built with the useSandpackNavigation hook:

```
import { useSandpackNavigation } from "@codesandbox/sandpack-react";
 
const CustomRefreshButton = () => {
  const { refresh } = useSandpackNavigation();
  return (
    <button type="button" onClick={() => refresh()}>
      Refresh Sandpack
    </button>
  );
};
```

## useActiveCode[](#useactivecode)

We implemented the SandpackCodeEditor on top of [codemirror/next](https://codemirror.net/6/), but it is super easy to switch to your favorite code editor. Let's connect the sandpack state to an instance of [AceEditor](https://securingsincity.github.io/react-ace/). You can use the useActiveCode hook, which gives you the code value and the updateCode callback.

```
import { useActiveCode } from "@codesandbox/sandpack-react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-textmate";
 
const CustomAceEditor = () => {
  const { code, updateCode } = useActiveCode();
 
  return (
    <AceEditor
      mode="javascript"
      defaultValue={code}
      onChange={updateCode}
      fontSize={14}
      height="300px"
      width="100%"
    />
  );
};
```

Now, let's put all of these custom components together:

```
export const CustomSandpack = () => (
  <SandpackProvider template="react">
    <CustomAceEditor />
    <SandpackPreview showRefreshButton={false} showOpenInCodeSandbox={false} />
    <CustomRefreshButton />
    <CustomOpenInCSB />
  </SandpackProvider>
);
```

It's not pretty, but with just a few lines of code, you can create a whole new component that uses the power of sandpack, but has all the UI and functionality you need for your specific use case.

## useSandpackConsole[](#usesandpackconsole)

The [SandpackConsole](/docs/advanced-usage/components#console) is implemented on top of this hook, which provides an interface to consume the logs from a specific sandpack client. Sandpack runs the console directly into the iframe. As a result, all console messages pass through the Sandpack protocol, where you can attach a listener to these messages in your own component or just use this hook.

```
const { logs, reset } = useSandpackConsole();
```

## useSandpackClient[](#usesandpackclient)

It registers a new sandpack client and returns its instance, listeners, and dispatch function. Using it when creating a custom component to interact directly with the client is recommended. For other cases, use useSandpack instead.

Example:

```
const { iframe, listen } = useSandpackClient();
 
React.useEffect(() => {
  const unsubscribe = listen((message: SandpackMessage) => {
    if (message.type === "resize") {
      setComputedAutoHeight(message.height);
    }
  });
 
  return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
 
<iframe ref={ifram} />;
```

For more details, you can check the [SandpackPreview implementation](https://github.com/codesandbox/sandpack/blob/061ad9d596bcca437dbb04a1ee8306afd5bfd925/sandpack-react/src/components/Preview/index.tsx#L119).

## useSandpackTheme[](#usesandpacktheme)

It exposes the theme object configured on SandpackContext and contains an id to ensure uniqueness for custom themes. This theme object is responsible for distributing all the style configurations for the component thee.

## useTranspiledCode[](#usetranspiledcode)

It returns the transpile module from the bundler, the same one evaluated inside it.

[Components](/docs/advanced-usage/components "Components")[Sandpack Client](/docs/advanced-usage/client "Sandpack Client")


--- 
## 📘 章节: Sandpack Client
**原文地址:** https://sandpack.codesandbox.io/docs/advanced-usage/client

# Sandpack Client

  

This library is an interface used to communicate with the CodeSandbox bundler.

It allows you to run Sandpack in plain JavaScript, or create your own wrapper for Vue, Svelte, or any other library.

## Install[](#install)

To use it, you have to install a different package:

npmyarnpnpm

```
npm i @codesandbox/sandpack-client
```

## Usage[](#usage)

sandpack-client implements three main methods to mount a bundler, and the choice between them will depend on which projects and environment you want to run. An environment might be a runtime JavaScript framework, a Node instance (which executes server scripts) or a static browser server:

*   SandpackRuntime: mounts the bundler used on codesandbox.io and runs runtime JavaScript frameworks in-browser.
*   SandpackNode: mounts a [Nodebox](https://github.com/codesandbox/nodebox-runtime) instance, which is designed to execute Node.js frameworks and applications. Besides that, you can build your own Node.js runtime client by using Nodebox's standalone package, in order to do so, check the [documentation](https://github.com/codesandbox/nodebox-runtime/blob/main/packages/nodebox/api.md).
*   SandpackStatic: mounts a simple service worker used for a static template, allowing users to develop vanilla sandboxes without extra any Sandpack sauce.

🎯

**loadSandpackClient**  
Alternatively, you can go for an async helper function that will adequately lazily load and mount a bundler, which is either SandpackRuntime or SandpackNode, given a set of files, environment, and dependencies.

### Quickstart[](#quickstart)

We recommend going for the loadSandpackClient implementation, as this's the main entry point to mount a bundler, and it abstracts the most common cases.

  

```
import { loadSandpackClient } from "@codesandbox/sandpack-client";
 
async function main() {
  // Iframe selector or element itself
  const iframe = document.getElementById("iframe");
  
  // Files, environment and dependencies
  const content: SandboxSetup = {
    files: { 
      // We infer dependencies and the entry point from package.json 
      "/package.json": { code: JSON.stringify({
        main: "index.js",
        dependencies: { uuid: "latest" },
      })},
      
      // Main file
      "/index.js": { code: `console.log(require('uuid'))` }
    },
    environment: "vanilla"
  };
  
  // Optional options
  const options: ClientOptions = {};
  
  // Properly load and mount the bundler
  const client = await loadSandpackClient(
    iframe, 
    content, 
    options
  );
  
  /**
   * When you make a change, you can just run `updateSandbox`. 
   * We'll automatically discover which files have changed
   * and hot reload them.
   */
  client.updateSandbox({
    files: {
      "/index.js": {
        code: `console.log('New Text!')`,
      },
    },
    entry: "/index.js",
    dependencies: {
      uuid: "latest",
    },
  });
}
```

## API reference[](#api-reference)

### Sandpack clients[](#sandpack-clients)

  

```
SandpackRuntime(
  iframe: HTMLElement | string,
  content: SandboxSetup,
  options?: ClientOptions
): Client
 
SandpackNode(
  iframe: HTMLElement | string,
  content: SandboxSetup,
  options?: ClientOptions
): Client
 
SandpackStatic(
  iframe: HTMLElement | string,
  content: SandboxSetup,
  options?: ClientOptions
): Client
```

The SandpackRuntime, SandpackNode and SandpackStatic methods are used to mount a bundler inside the specified iframe element or selector. SandpackRuntime mounts the bundler used on codesandbox.io and runs runtime JavaScript frameworks in-browser, while SandpackNode mounts a Nodebox instance, which is designed to execute Node.js frameworks and applications.

**Parameters**

*   iframe: The iframe element or selector in which to mount the bundler.
*   content: The files, environment, and dependencies to use for the sandbox.
*   options: (optional) An object containing additional options to use when loading the bundler.

### loadSandpackClient[](#loadsandpackclient)

  

```
const client = async loadSandpackClient(
  iframe: HTMLElement | string,
  content: SandboxSetup,
  options?: ClientOptions
): Promise<Client

```

Loads and mounts the sandpack bundler inside the specified iframe element or selector.

**Parameters**

*   iframe: The iframe element or selector in which to mount the sandpack bundler.
*   content: The files, environment, and dependencies to use for the sandbox.
*   options: (optional) An object containing additional options to use when loading the sandpack bundler.

**Returns**

A promise that resolves to a Client object (SandpackRuntime or SandpackNode), which can be used to interact with the loaded sandpack bundler.

💡

Both SandpackRuntime and SandpackNode have the same helper functions, which you can interact with. More details on each of these below.

### Client methods[](#client-methods)

#### updateSandbox[](#updatesandbox)

  

```
client.updateSandbox(content: SandboxSetup): void
```

Sends new content like files and dependencies to the preview. It will automatically hot update the preview with the new files and options.

**Parameters**

*   content: An object containing updates to the files, entry point, and/or dependencies for the sandbox, see [SandboxSetup](/docs/advanced-usage/client#sandboxsetup).

#### updateOptions[](#updateoptions)

  

```
client.updateOptions(options: ClientOptions): void
```

Updates the given options and then updates the preview.

**Parameters**

*   options: An object containing updates the client options, see [ClientOptions](/docs/advanced-usage/client#clientoptions).

#### dispatch[](#dispatch)

  

```
client.dispatch(data: any): void
```

The dispatch method is used to send an event to the sandpack bundler and all other listeners. The method accepts a single argument, which is the data to send with the event. When the event is dispatched, the internal id of the client will also be passed, so that only the bundler that performed the handshake with this client instance will respond to the event.

**Parameters**

*   data: The data to send with the event.

#### listen[](#listen)

  

```
client.listen(callback: (message: any) => void): void
```

The listen method is used to listen for events coming from the sandpack bundler that performed the handshake with this client instance. The method accepts a callback function that will be called whenever an event is received from the bundler. The callback function will be passed the message data for the event. The listen method uses the internal id of the client to filter out events coming from other bundlers.

**Parameters**

*   callback: A function that will be called whenever an event is received from the bundler. The function will be passed the message data for the event.

#### getCodeSandboxURL[](#getcodesandboxurl)

  

```
client.getCodeSandboxURL(): {
  sandboxId: string,
  editorUrl: string,
  embedUrl: string,
}
```

The getCodeSandboxURL method creates a sandbox from the current files and returns an object containing the sandbox id, editor URL, and embed URL for the sandbox. The returned object has the following form:

  

```
{
  sandboxId: sandbox_id,
  editorUrl: `https://codesandbox.io/s/${sandbox_id}`,
  embedUrl: `https://codesandbox.io/embed/${sandbox_id}`,
}
```

*   sandboxId: The id of the created sandbox.
*   editorUrl: The URL of the sandbox editor.
*   embedUrl: The URL that can be used to embed the sandbox in an iframe.

### Interfaces[](#interfaces)

#### SandboxSetup[](#sandboxsetup)

  

```
{
  /**
   * Files, keys are paths.
  **/
  files: {
    [path: string]: {
      code: string
    }
  },
  /**
   * Dependencies; supports npm and GitHub dependencies
  **/
  dependencies?: {
    [dependencyName: string]: string
  },
  /**
   * Default file to evaluate
  **/
  entry?: string,
  /**
   * The sandbox template to use; this is inferred from the files and package.json if not specified
  **/
  template?: SandpackTemplate
}
```

#### ClientOptions[](#clientoptions)

  

```
{
  /**
   * Paths to external resources
   */
  externalResources?: string[];
  /**
   * Location of the bundler. Defaults to `${version}-sandpack.codesandbox.io`
   */
  bundlerURL?: string;
  /**
   * Width/Height of the iframe.
   */
  width?: string;
  height?: string;
  /**
   * If the bundler should skip the third step, which is evaluation. 
   * Useful if you only want to see transpiled results.
   */
  skipEval?: boolean;
  /**
   * Boolean flags to trigger certain UI elements in the bundler
   */
  showOpenInCodeSandbox?: boolean;
  showErrorScreen?: boolean;
  showLoadingScreen?: boolean;
}
```

[Hooks](/docs/advanced-usage/hooks "Hooks")[Static](/docs/advanced-usage/static "Static")


--- 
## 📘 章节: Static
**原文地址:** https://sandpack.codesandbox.io/docs/advanced-usage/static

# Static

## Run a static web server in any browser.

Our static template is powered by the NPM package [static-browser-server](https://www.npmjs.com/package/static-browser-server), which is documented here in case you'd like to use it outside of Sandpack.

## Install static browser server[](#install-static-browser-server)

npmyarn

```
npm i static-browser-server
```

### Setup the static server[](#setup-the-static-server)

To setup a static browser server, setup a preview controller pointing to the static-browser-server preview [files](https://unpkg.com/browse/static-browser-server@latest/out/preview/) hosted on a wildcard domain. We're hosting the latest version at CodeSandbox on https://preview.sandpack-static-server.codesandbox.io, but feel free to self-host it.

  

```
// Map of files
const files = new Map<string, string>(["index.html", "Hello world!"]);
 
// Setup a preview controller
const controller = new PreviewController({
  baseUrl: "https://preview.sandpack-static-server.codesandbox.io",
  // Function to get the file content for the server this can also be async
  getFileContent: (filepath) => {
    const content = files.get(filepath);
    if (!content) {
        throw new Error("File not found");
    }
    return content;
  },
});
 
// Initialize the preview
// This will start up a relay frame and return a url which you can use to show the preview
const previewUrl = await this.previewController.initPreview();
 
// Create a preview frame and set the src url to the returned preview url
const iframe = document.createElement("iframe");
iframe.setAttribute("src", previewUrl);
```

[Sandpack Client](/docs/advanced-usage/client "Sandpack Client")[Experimental bundler (beta)](/docs/advanced-usage/bundlers "Experimental bundler (beta)")


--- 
## 📘 章节: Experimental bundler (beta)
**原文地址:** https://sandpack.codesandbox.io/docs/advanced-usage/bundlers

# Experimental bundler (beta)

  

This [experimental Sandpack bundler](https://github.com/codesandbox/sandpack-bundler/) aims to eventually replace the current Sandpack with a more streamlined and faster version.

Additionally, it allows us to implement even more improvements in the future, thanks to a fresh codebase that allowed us to remove many of the bottlenecks of the previous bundler.

**The new bundler:**

*   Skips the transpiling step for dependencies by caching them in our custom-built CDN.
*   Fetches dependencies from our very own CDN, no longer third-party involved.
*   Uses fewer resources (avoids fetching unnecessary files) and is significantly faster.

## How to use[](#how-to-use)

You just need to set the new bundler URL in your Sandpack instance:

  

**Examples:**

  

```
<SandpackProvider
  template="react"
  options={{ bundlerURL: "https://sandpack-bundler.codesandbox.io" }}
>
  {/* Children */}
</SandpackProvider>
```

  

```
<Sandpack
  template="react"
  options={{ bundlerURL: "https://sandpack-bundler.codesandbox.io" }}
/>
```

  

**Preview**

export default function App() {
  return <h1\>Hello world</h1\>
}

[Open on CodeSandboxOpen Sandbox](https://codesandbox.io/api/v1/sandboxes/define?undefined&environment=create-react-app "Open in CodeSandbox")

💡

If you have any feedback, feature requests or if you're interested in collaborating on the development of the new bundler, feel free to reach out to one of the maintainers on this [discussion on GitHub](https://github.com/codesandbox/sandpack/discussions/416) or on the [main repository](https://github.com/codesandbox/sandpack-bundler/).

## Known issues & limitations[](#known-issues--limitations)

*   ✅ Support the React and Solid templates.
*   ✅ Watch console message.
*   ⏳ Other templates: Vue, Svelte, Vanilla, etc.
*   ⏳ No support for loading private dependencies.
*   ❌ No aliasing, git and file dependencies support in package.json.
*   ❌ It doesn't watch package.json changes.

## Same benefits as the previous bundler[](#same-benefits-as-the-previous-bundler)

**Security**

The bundler evaluates and transpiles all files in an iFrame under a different subdomain. This is important because it prevents attackers from tampering with cookies of the host domain when evaluating code.

**Scoped styles/JavaScript execution**

There's no risk of any executed code affecting the main page, which avoids unexpected styles or unhandled errors.

**Performance**

We heavily make use of Web Workers for transpilations, and only for sandboxes that are in the viewport and the user is interacting with, meaning that we only use resources as needed.

**Bundle Size**

Another reason to host the bundler externally is code splitting: we split all our transpilers away and load them on-demand.

**React DevTools**

The Sandpack bundler supports running react-devtools-inline in isolated mode, as an external dependency. This means you can run more than one instance per page and lazily load it.

**Others**

*   npm dependency support.
*   Hot module reloading.
*   Error overlaying.
*   Caching.

## Benchmarks[](#benchmarks)

Legacy

Experimental

Memory usage (iframe thread)

~20MB

~ 5MB

Memory usage (babel) \[1\]

6.8 - 10.2MB

6.6 - 6.6MB

Network (compressed) \[2\]

2.8MB

863kb

Time to load (first time) \[3\]

9293ms

4149ms

Time to load (second time) \[4\]

565ms

566ms

Time to load \[5\]

854ms

214ms

*   \[1\] idle - peek
*   \[2\] Exclude local resource & external, except Sandpack & disabled cache
*   \[3\] Incognito window (fresh cache) & Fast 3G
*   \[4\] Cache enabled & Fast 3G
*   \[5\] Incognito window (fresh cache) & no throttling

[Static](/docs/advanced-usage/static "Static")[Serving static files (beta)](/docs/advanced-usage/serving-static-files "Serving static files (beta)")


--- 
## 📘 章节: Serving static files
**原文地址:** https://sandpack.codesandbox.io/docs/advanced-usage/serving-static-files

# Serving static files

Sandpack is introducing beta support for serving static files inside each Sandpack instance. Files such as SVGs, fonts, images, etc., can now be used by enabling the flag specified below.

By enabling this feature, Sandpack will register a new Service Worker in the iframe, intercepting requests and sending back the content from your Sandpack instance. Before using it in production, carefully test your Sandboxes and remember that the current implementation might have limitations and unknown issues.

**Limitation:** All static files served by Sandpack should be placed inside the /public folder. If this doesn't work for you, please open a new issue on [GitHub](https://github.com/codesandbox/sandpack/issues).

  

```
<SandpackProvider
  options={{
    experimental_enableServiceWorker: true,
    experimental_enableStableServiceWorkerId: false // set this true, in case private package are used
  }}
>
  {...}
</SandpackProvider>
```

  

```
<Sandpack
  options={{
    experimental_enableServiceWorker: true,
  }}
/>
```

## Example[](#example)

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default () \=> (
  <Sandpack
    files\={{
      "/public/logo.svg": \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348">
<title>React Logo</title>
<circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
<g stroke="#61dafb" stroke-width="1" fill="none">
  <ellipse rx="11" ry="4.2"/>
  <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
  <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
</g>
</svg>
\`,
      "/App.js": \`export default function App() {
  return (
    <>
      <h1>Hello React</h1>
      <img width="100" src="/public/logo.svg" />
    </>
  );
}
      \`,
    }}
    options\={{
      experimental\_enableServiceWorker: true,
    }}
    template\="react"
  />
);

Preview

  
  

[Experimental bundler (beta)](/docs/advanced-usage/bundlers "Experimental bundler (beta)")[Overview](/docs/guides "Overview")


--- 
## 📘 章节: Guides
**原文地址:** https://sandpack.codesandbox.io/docs/guides

# Guides

Here you can find some guides or recipes on using the Sandpack in different situations. These examples are basic implementations, and you need to consider improving for production, but you can find more detailed guides in the [advanced usage](/docs/advanced-usage/provider) section.

*   Integrate [Monaco Editor](/docs/guides/integrate-monaco-editor)
*   Integrate [private packages](/docs/guides/private-packages)
*   Integrate Prettier for code formatting: [CodeSandbox example](https://codesandbox.io/s/sandpack-prettier-1po91?file=/src/App.js)
*   Integrate ESLint for static code analysis: [CodeSandbox example](https://codesandbox.io/s/sandpack-eslint-vztlt?file=/src/App.tsx)
*   Integrate Real Time collabration using firepad: [repo example](https://github.com/hussamkhatib/Real-time-collaborative-sandpack)

[Serving static files (beta)](/docs/advanced-usage/serving-static-files "Serving static files (beta)")[Local dependencies](/docs/guides/local-dependencies "Local dependencies")


--- 
## 📘 章节: Local dependencies/packages
**原文地址:** https://sandpack.codesandbox.io/docs/guides/local-dependencies

# Local dependencies/packages

This guide will show you how to consume local dependencies on Sandpack using an external library to bundle them. This can be useful when developing applications or libraries that are not yet ready for publication on npm or other registries.

### Step 1: Bundle your local library with tsup[](#step-1-bundle-your-local-library-with-tsup)

The easiest way to bundle your TypeScript libraries is to use tsup.

1.  Install tsup as a development dependency:

```
$ npm install --save-dev tsup
```

2.  Create a tsup.config.js file at the root of your library's directory with the following contents:

```
import { defineConfig } from "tsup";
 
export default defineConfig([
  {
    entry: ["./design-system/index.ts"], // your library path
    treeshake: true,
    minify: true,
    verbose: true,
    dts: true,
    external: ["react", "react-dom"],
    clean: true,
    outDir: "./design-system/build-sandpack", // build output
  },
]);

```

3.  Replace ./design-system/index.ts with the path to your library's entry point.
    
4.  Run tsup in your library's directory to generate the bundled file:
    

```
$ tsup
```

This command will create a build-sandpack directory inside your library's directory with the bundled output.

### Step 2: Consume the local dependency on Sandpack[](#step-2-consume-the-local-dependency-on-sandpack)

Now that we have the bundled file, we need to consume it on Sandpack.

1.  Import the bundled file as a raw text file:

```
import designSystemRaw from "../design-system/build-sandpack?raw";
```

Replace ../design-system/build-sandpack with the path to your bundled file.

2.  Pass the designSystemRaw variable to Sandpack's files prop along with a fake package.json file and a fake index.js file:

```
import designSystemRaw from "../design-system/build-sandpack?raw";
 
<Sandpack
  files={{
    "/App.tsx": `import { Button, Tag } from "@internals/ds";
 
export default function Sample() {
  return (
    <>
      <Button type="primary">Button1</Button>
      <Button type="secondary">Button2</Button>
      <Tag>Tag</Tag>
    </>
  );
}
`,
    "/node_modules/@internals/design-system/package.json": {
      hidden: true,
      code: JSON.stringify({
        name: "@design-system",
        main: "./index.js",
      }),
    },
    "/node_modules/@internals/design-system/index.js": {
      hidden: true,
      code: designSystemRaw,
    },
  }}
  template="react-vite"
/>
```

Replace /App.tsx with the path to your application's main file.

Here's an example of a Sandpack project that uses local dependencies and an external library to bundle them: [https://github.com/codesandbox/sandpack-local-dependencies](https://github.com/codesandbox/sandpack-local-dependencies)

[Overview](/docs/guides "Overview")[Hosting the Bundler](/docs/guides/hosting-the-bundler "Hosting the Bundler")


--- 
## 📘 章节: Hosting the Bundler
**原文地址:** https://sandpack.codesandbox.io/docs/guides/hosting-the-bundler

# Hosting the Bundler

💡

You can also host the bundler by yourself, all necessary files are in the sandpack folder.

If you want to host the bundler yourself, you will need to do a few things.

*   The bundler is part of the codesandbox-client codebase: [https://github.com/codesandbox/codesandbox-client](https://github.com/codesandbox/codesandbox-client)
*   Clone the codesandbox-client and install the dependencies in the root folder (yarn install).
*   yarn build:deps to build some of the packages lerna needs for internal links.
*   create your instance of sandpack with yarn build:sandpack.

This creates a www folder in the root of codesandbox-client. That www folder is the sandpack folder sandpack-client connects to on {version}-sandpack.codesandbox.io. Once you have this hosted on your end you can pass bundlerURL when calling:

```
new SandpackClient(iframe, sandboxInfo, {
  bundlerURL: "https://your-hosted-version",
});
```

or, if you use sandpack-react, you can bundlerURL in the options of the Sandpack preset.

### Why[](#why)

There are few reasons for hosting the bundler like this, as opposed to having it exported as library code.

#### Security[](#security)

The bundler evaluates and transpiles all files in an iframe under a different subdomain. This is important, because it prevents attackers from tampering with cookies of the host domain when evaluating code.

#### Performance[](#performance)

We heavily make use of Web Workers for transpilations. Almost all our transpilation happens in web workers, and there is no easy way yet to bundle this in a library.

#### Bundle Size[](#bundle-size)

Another reason to host the bundler externally is because of code splitting: we split all our transpilers away and load them on-demand. If a user doesn't use sass we won't load the transpiler. This wouldn't be possible if we would give one big JS file as the library.

#### Offline Support[](#offline-support)

We use Service Workers to download all transpilers in the background, so the next time a user visits your website they don't have to download the bundler anymore and it can be used offline. This is possible because we host the service worker externally.

## Self-host private packages[](#self-host-private-packages)

  

The custom private NPM registry allows Sandpack instances to retrieve private NPM packages from your own registry. This option requires running a third service (Node.js server) and configuring your Sandpack provider to consume these dependencies from another registry, not the public ones.

**You'll need:**

*   Host a Node.js server, which will run registry proxy;
*   GitHub/NPM authentication token with read access;

### Self-host the proxy[](#self-host-the-proxy)

We recommend hosting a service that allows you to proxy your private packages from a registry (GitHub/Npm/your own) to a new one, which would make the packages available through another URL. As Sandpack bundles everything in-browser, it needs to find a way to connect to the registry which provides the project dependencies. First, Sandpack will try to fetch all dependencies from public registries, for example, react or redux. Then you can let Sandpack know which dependencies (or scoped dependencies) should be fetched from a different registry. For example, your custom registry.

#### Our recommendation[](#our-recommendation)

Suppose you don't already have a public registry, we recommend using [Verdaccio](https://verdaccio.org/). An open-source project that creates a private registry and can proxy other registries, such as GitHub and Npm. You can find examples of how to use the [examples folder](https://github.com/codesandbox/sandpack/tree/main/examples) in the main repository.

### Sandpack configuration[](#sandpack-configuration)

Once the proxy is running and configured, you need to set some options in your Sandpack context:

```
<Sandpack
  customSetup={{
    dependencies: { "@codesandbox/test-package": "1.0.5" },
    npmRegistries: [
      {
        enabledScopes: ["@codesandbox"],
        limitToScopes: true,
        registryUrl: "PROXY_URL",
      },
    ],
  }}
  files={{
    "/App.js": `import { Button } from "@codesandbox/test-package"
export default function App() {
  return (
    <div>
      <Button>I'm a private Package</Button>
    </div>
  )
}
`,
  }}
  template="react"
/>
```

### Security[](#security-1)

It's essential to keep the information and tokens of the npm registry private! By using this method, it's best to keep in mind that it could expose all private packages in your account. Be careful where and how this proxy will be used. Make sure to use authentication tokens with **read-only access**.

It's also possible to expose only specific packages. If the custom scopes are @scope/package-name instead of @scope/\*, it will only expose that particular package. You can even do something like @scope/design-system\* to expose all packages of the design system.

[Local dependencies](/docs/guides/local-dependencies "Local dependencies")[Integrate Monaco Editor](/docs/guides/integrate-monaco-editor "Integrate Monaco Editor")


--- 
## 📘 章节: Integrate Monaco Editor
**原文地址:** https://sandpack.codesandbox.io/docs/guides/integrate-monaco-editor

# Integrate Monaco Editor

## Introduction[](#introduction)

The [monaco-editor](https://microsoft.github.io/monaco-editor/) is a well-known web technology based code editor that powers VS Code. This section will guide you on how to use the Monaco Editor in Sandpack

💡

If you want to jump right into the code check this [**sandbox example**](https://codesandbox.io/s/sandpack-monaco-integration-citxd)

## Install the Monaco library[](#install-the-monaco-library)

To use Monaco in Sandpack first we need to install the Monaco library by running the following command:

```
yarn add @monaco-editor/react
```

This library handles the setup process of the Monaco editor and provides a clean API to interact with Monaco from any React environment. Here is the [GitHub repository](https://github.com/suren-atoyan/monaco-react#readme) if you want to learn more about the library

## Integration[](#integration)

If you are not familiar with the Monaco library this is how a basic Editor component looks:

```
import React from "react";
import Editor from "@monaco-editor/react";
 
function App() {
  return (
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      defaultValue="// some comment"
    />
  );
}
```

Now create a component called MonacoEditor, and put the Editor component inside a SandpackStack. This is what the MonacoEditor component could look like, you can play with the properties to meet your needs.

```
import Editor from "@monaco-editor/react";
import {
  useActiveCode,
  SandpackStack,
  FileTabs,
  useSandpack,
} from "@codesandbox/sandpack-react";
 
function MonacoEditor() {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
 
  return (
    <SandpackStack style={{ height: "100vh", margin: 0 }}>
      <FileTabs />
      <div style={{ flex: 1, paddingTop: 8, background: "#1e1e1e" }}>
        <Editor
          width="100%"
          height="100%"
          language="javascript"
          theme="vs-dark"
          key={sandpack.activeFile}
          defaultValue={code}
          onChange={(value) => updateCode(value || "")}
        />
      </div>
    </SandpackStack>
  );
}
```

💡

If you are unfamiliar with any of the code in this guide make sure to check the [**Advanced Usage**](https://sandpack.codesandbox.io/docs/advanced-usage/provider) section for a better understanding.

Finally, using a SandpackProvider you can integrate the MonacoEditor component like the following example:

```
export default function MySandpack() {
  return (
    <SandpackProvider template="react" theme="dark">
      <SandpackLayout>
        <MonacoEditor /> // Your Monaco Editor Component
        <SandpackPreview style={{ height: "100vh" }} />
      </SandpackLayout>
    </SandpackProvider>
  );
}
```

[Hosting the Bundler](/docs/guides/hosting-the-bundler "Hosting the Bundler")[Server-side rendering](/docs/guides/ssr "Server-side rendering")


--- 
## 📘 章节: Server-side rendering
**原文地址:** https://sandpack.codesandbox.io/docs/guides/ssr

# Server-side rendering

The getSandpackCssText function, which is available in the main package, is responsible for getting the Sandpack CSS string and server-side render it. Furthermore, Sandpack uses [stitches/core](https://stitches.dev/) under the hood to generate and dedupe theme variation, ensuring a consistent and lightweight CSS output.

```
import { getSandpackCssText } from "@codesandbox/sandpack-react";
 
const cssTextOutput = getSandpackCssText();
```

## How to use it[](#how-to-use-it)

Here's some examples of how to use in some popular React frameworks.

💡

For a better hydration strategy, we highly recommend adding an id="sandpack" to your style tag.

### Next.js (app dir)[](#nextjs-app-dir)

[See the example project](https://github.com/codesandbox/sandpack/tree/main/examples/nextjs-app-dir)

  

```
// components/sandpack-styles.tsx
"use client";
 
import { getSandpackCssText } from "@codesandbox/sandpack-react";
import { useServerInsertedHTML } from "next/navigation";
 
/**
 * Ensures CSSinJS styles are loaded server side.
 */
export const SandPackCSS = () => {
  useServerInsertedHTML(() => {
    return (
      <style
        dangerouslySetInnerHTML={{ __html: getSandpackCssText() }}
        id="sandpack"
      />
    );
  });
  return null;
};
```

  

```
// app/layout.tsx
 
import { SandPackCSS } from "@/components/sandpack-styles";
 
export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en">
      <head>
        <SandPackCSS />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

  

```
import { Sandpack } from "@codesandbox/sandpack-react";
 
export default function Home() {
  return (
    <div>
      <Sandpack theme="dark" />
    </div>
  );
}
```

### Next.js[](#nextjs)

[See the example project](https://github.com/codesandbox/sandpack/tree/main/examples/nextjs)

  

```
// pages/_document.tsx
 
import { getSandpackCssText } from "@codesandbox/sandpack-react";
import { Html, Head, Main, NextScript } from "next/document";
 
export default function Document() {
  return (
    <Html>
      <Head>
        <style
          dangerouslySetInnerHTML={{ __html: getSandpackCssText() }}
          id="sandpack"
          key="sandpack-css"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

### Gatsby[](#gatsby)

[See the example project](https://github.com/codesandbox/sandpack/tree/main/examples/gatsby)

```
// gatsby-ssr.js
import * as React from "react";
import { getSandpackCssText } from "@codesandbox/sandpack-react";
 
export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <style
      id="sandpack"
      key="sandpack-css"
      dangerouslySetInnerHTML={{
        __html: getSandpackCssText(),
      }}
    />,
  ]);
};
```

### Examples[](#examples)

Still not clear, take a look at these [examples](https://github.com/codesandbox/sandpack/tree/main/examples).

[Integrate Monaco Editor](/docs/guides/integrate-monaco-editor "Integrate Monaco Editor")[Community](/docs/resources/community "Community")


--- 
## 📘 章节: Community
**原文地址:** https://sandpack.codesandbox.io/docs/resources/community

# Community

## Values[](#values)

### Accessibility[](#accessibility)

Sandpack enables creators. Nothing should stand in someone's way from expressing their ideas. Sandpack fills the gap between the complexity of publishing and expressing yourself for public visualization and collaboration.

As a result, Sandpack creates interactive code snippets to be easily integrated into any project, regardless of the development language and the user setup. Also, giving you a fully live coding experience in the browser that brings the development experience from CodeSandbox closer to the consumer of the content on your website. We believe that getting live coding experience should not be harder than this.

### Collaboration[](#collaboration)

With Sandpack, you're always one click away from opening a sandpack in CodeSandbox. This way, you can easily share bug reports, provide feedback on someone’s else sandpack, or fork your changes behind a unique URL.

### Empowerment[](#empowerment)

Sandpack gives you a painless live coding environment in minutes and lets you focus on what matters, which is expressing your ideas through coding. Sandpack components are designed to be extensible and customizable no matter what is your environment, layout, or needs. It also does everything to keep everybody in the state of the flow as the content and code are next to each other so no other tools required to play with the code.

Also, it embeds the browser bundler that powers [CodeSandbox](http://codesandbox.io/) and takes advantage of features like NPM dependency support, hot module reloading, error overlaying, and caching.

## Roadmap[](#roadmap)

The following represents a high-level overview of Sandpack's roadmap.

Check out the [roadmap on GitHub](https://github.com/codesandbox/sandpack/projects/1) to get informed about what we’re working on, and what will come later. If you have any questions or comments please provide us feedback on [Discord](https://discord.gg/Pr4ft3gBTx) or [GitHub](https://github.com/codesandbox/sandpack/discussions).

### Areas[](#areas)

We break our roadmap into 3 key areas: **Community, DevX, and Usability**.

#### Community[](#community)

In order to grow the community and increase the adoption, we have to support more ways to consume Sandpack, regardless of the framework or the way to write a snippet of code.

#### DevX[](#devx)

Solve technical debts, implement new features to keep up to date with the latest releases from the community, and cover other community needs.

#### Usability[](#usability)

With Sandpack we strive to provide the best experience no matter where the given Sandpack is embedded, so SEO or usability is also a key part of improving the project.

### Priorities, Next up[](#priorities-next-up)

Features, bugs, or improvements that are considered for implementation in the next few months. Besides this, we encourage you to contribute to the project and drive our roadmap through contributions.

### Planned for later[](#planned-for-later)

The rest of the issues that we have in mind for carry out eventually, probably later than 3-4 months from now.

### Disclaimer[](#disclaimer)

The purpose of our roadmap is to outline the general product direction for Sandpack. It is intended for information purposes only and it is not a commitment to deliver any material, code, or functionality. You should be aware that priorities and direction may change at any time and the order of issues does not reflect any type of priority.

## Community[](#community-1)

For general help using Sandpack, please check out the documentation. For additional help, you can use one of these channels to ask a question or find out if somebody else had the same before:

[Discord](https://discord.gg/Pr4ft3gBTx) - For live discussions with the Community

[GitHub issues](https://github.com/codesandbox/sandpack/issues) - Bug reports, feature requests, and contributions

[GitHub discussions](https://github.com/codesandbox/sandpack/discussions) - Ideas, Q&A, show and tell, and general thoughts

[GitHub projects](https://github.com/codesandbox/sandpack/projects/1) - Our roadmap

[Twitter](https://twitter.com/codesandbox) - Get the latest news

## License[](#license)

Please see the [LICENSE file](https://github.com/codesandbox/sandpack/blob/main/LICENSE) for licensing information, and our [FAQ](/docs/faq#sandpack-license) for any questions you may have on that topic.

## Contribution Guide[](#contribution-guide)

Any type of contribution is welcome! Sandpack can grow faster through the contributions of the community! Thanks so much for your enthusiasm and your work — we appreciate everything you do!

Before getting started please check out our contribution guide. If you would like to contribute to Sandpack and get involved but you’re not sure where to start with feel free to dive into [issues](https://github.com/codesandbox/sandpack/issues) with a good first issue label. If you have any questions, please open a draft PR or visit our [Discord](htpps://discord.gg/Pr4ft3gBTx) where the Sandpack team can help you.

### Contributing to Sandpack[](#contributing-to-sandpack)

Thank you for your interest in contributing! We embrace community contributions as it brings Sandpack to a larger audience and makes the project better. Contribution guidelines are listed below. If you're unsure about how to start contributing or have any questions even after reading our guide, feel free to reach out us on [Discord](https://discord.gg/Pr4ft3gBTx).

### Code of conduct[](#code-of-conduct)

Please follow our [Code of conduct](https://github.com/codesandbox/codesandbox-client/blob/master/CODE_OF_CONDUCT.md) in the context of any contributions made to Sandpack.

### Open development[](#open-development)

Anyone can contribute. The primary communication about development on Sandpack happens in [GitHub issues](https://github.com/codesandbox/sandpack/issues) and [GitHub discussions](https://github.com/codesandbox/sandpack/discussions) where the Sandpack team and contributors can collaborate.

### Your first contribution[](#your-first-contribution)

We appreciate first time contributors and we are happy to assist you in getting started. In case of questions, just create a draft PR or reach out to us via [Discord](https://discord.gg/Pr4ft3gBTx).

### Types of contributions[](#types-of-contributions)

#### Docs[](#docs)

Our goal is to keep our docs comprehensive and updated. If you would like to help us in doing so, we are grateful for any kind of contribution:

*   Report missing content
*   Fix errors and possible typos in existing docs
*   Help us add more guides to our docs

#### Themes[](#themes)

We're open to supporting new Sandpack themes because our key goal is empowering developers to include custom live coding experiences over the web, regardless of your website layout or level of design expertise. That's why we provide plenty of options under @codesandbox/sandpack-themes, and we want to offer even more options. So, how can you contribute to new themes?

1.  Create a new file in [codesandbox/sandpack/sandpack-themes/src](https://github.com/codesandbox/sandpack/tree/main/sandpack-themes/src) folder with following file \[theme name\].ts
2.  The content of this file must be an export for an object that contains the theme:

```
import type { SandpackTheme } from "./types";
 
export const themeName: SandpackTheme = {
  ...themeObject,
};
```

3.  Include your new theme into the [index.ts](https://github.com/codesandbox/sandpack/blob/main/sandpack-themes/src/index.ts) file, that exposes all themes.

#### Features[](#features)

To request new features, please create an issue on this project. Automatically a triage label will be added and the Sandpack team will follow up on your issue if that needs some clarification.

#### Upvoting issues and features[](#upvoting-issues-and-features)

You are welcome to add your own reactions and feedback to the existing issues.

We will consider 👍 as the given issue is important to you.

#### Reporting bugs[](#reporting-bugs)

Bug reports can make Sandpack better. So if you spot any issues with Sandpack please create an issue and follow the instructions using the [bug report template](https://github.com/codesandbox/sandpack/issues/new?assignees=&labels=bug%2Ctriage&template=BUG.md).

### Running Locally[](#running-locally)

**General**

*   Install [Node.js](https://nodejs.org/en/) version 14(latest stable)
    *   If you are using [nvm](https://github.com/nvm-sh/nvm#installation) (recommended) running nvm use will automatically choose the right node version for you.

```
nvm use 14
```

*   Install all project dependencies by running:

```
yarn
```

*   To start the development mode you need to build all dependencies first by running:

```
yarn build
```

**Running Sandpack Docs**

At the root folder run:

```
yarn dev:docs
```

Or at the docs folder run:

```
yarn run serve
```

**Running Sandpack Landing**

The landing page is powered by [Next.js](https://nextjs.org/)

At the root folder run:

```
yarn dev:landing
```

Or at the landing folder run:

```
yarn dev
```

**Running Sandpack React in development mode**

It will open a playground page powered by [Storybook](https://storybook.js.org/).

At the root folder run:

```
yarn dev:react
```

[Server-side rendering](/docs/guides/ssr "Server-side rendering")[FAQ](/docs/resources/faq "FAQ")


--- 
## 📘 章节: Frequently Asked Questions
**原文地址:** https://sandpack.codesandbox.io/docs/resources/faq

# Frequently Asked Questions

## General questions[](#general-questions)

#### What is Sandpack?[](#what-is-sandpack)

Sandpack is an open ecosystem of components and utilities that allow you to compile and run modern JavaScript frameworks in the browser. You can either use one of our predefined components for embedding the _CodeSandbox_ experience into your projects, or you can build your own version of sandpack, on top of our standard components and utilities.

#### What license do Sandpack and Nodebox use?[](#what-license-do-sandpack-and-nodebox-use)

Sandpack is licensed under the [Apache License 2.0.](https://github.com/codesandbox/sandpack/blob/main/LICENSE)

The Apache License 2.0 is in the permissive category, meaning that you can do (nearly) anything you want with the code, with very few exceptions. You must include the following in the copy of the code, whether you have modified it or not: the original copyright notice, copy of the license, statement of significant changes that have been made (only if applicable), and copy of the notice file.

**To sum up:**

For **personal usage**, there are no limitations on how you can use Sandpack and you can freely use all of our templates, regardless of whether you are building a private or public project.

For **commercial usage**, you can freely use all Sandpack templates except:

*   nextjs, any vite template, astro, node.
*   Any other sandbox that uses Nodebox as a runtime environment.

The templates and sandboxes listed above are covered by the [Nodebox license](https://github.com/codesandbox/nodebox-runtime/blob/main/packages/nodebox/LICENSE) and a EULA that is shipped with the Nodebox runtime, which has some restrictions on commercial usage.

**If you are interested in using Sandpack 2.0 or Nodebox for commercial purposes, please [contact us](/cdn-cgi/l/email-protection#92e1f3fef7e1d2f1fdf6f7e1f3fcf6f0fdeabcfbfd).**

## Nodebox[](#nodebox)

What Node.js version does Sandpack 2.0 run?

We are aiming for compatibility with the last version. Currently, this would be Node.js@18 (experimental features might be missing).

What is Nodebox?

Nodebox is a runtime for executing Node.js code in the browser. Sandpack 2.0 uses Nodebox to run server-side examples directly in the browser. For example, you can run a Vite template such as React and Vue directly on your website.

For further details about Nodebox, check the [announcement post](https://codesandbox.io/post/announcing-sandpack-2) on the CodeSandbox blog.

How does Nodebox work?

Nodebox establishes a worker that contains an environment capable of running Node.js code. This is achieved by polyfilling some of the Node.js standard APIs, like fs and net, which guarantees Node.js compatibility but not complete feature parity.

Does Nodebox work offline?

Starting Nodebox requires a network connection to download all the node modules from the sandpack cdn https://sandpack-cdn-v2.codesandbox.io and load the preview domain for each port https://id-port.nodebox.codesandbox.io, once the previews have loaded Nodebox will work entirely offline.

What is the difference between Sandpack 2.0 and Nodebox?

Nodebox is a runtime that runs Node.js in the browser, developed by the CodeSandbox team and introduced with Sandpack 2.0. While it is one of the core building blocks of Sandpack 2.0, Nodebox can be used standalone, as explained in the next topic.

Still, it is expected that the development of Nodebox will be intertwined with that of Sandpack.

Can I run Nodebox without Sandpack?

Yes, we made Nodebox available as a standalone package on npm. So you can find all details about installing and using it on the GitHub repository.

Is it possible to connect to a database in Nodebox?

No. Nodebox is currently unable to connect to any external databases. However, serverless databases (Supabase, DynamoDB, Google Cloud Datastore, for example) can still be used normally since these options rely on standard REST APIs.

Still, we are currently exploring other alternatives for standard databases, like microVMs, which still need to be integrated into Sandpack.

What are the limitations of Nodebox?

*   Native node modules (Prisma, SWC, Sodium-native) will only work if they also release a WebAssembly version; we don't support napi modules because of browser limitations.
*   Anything requiring native sockets; this will mainly be databases (Postgres, MongoDB, MySQL, ...).
*   Large projects and monorepos are not optimally supported.

What frameworks does Nodebox support?

At this moment, we support most of the frameworks based on Vite 4:

*   React
*   Vue
*   Preact
*   Svelte

And other frameworks, such as:

*   Next.js
*   Astro
*   Vuepress
*   Express.js

If you don't find your favorite framework, feel free to reach out to us through a GitHub issue, and then we can add it to the internal roadmap, among other frameworks.

I can’t see my favorite framework on the framework support list. How can I contribute?

If you are still looking for your favorite framework, feel free to reach out to us through a GitHub issue, and then we can add it to the internal roadmap, among other frameworks.

What’s the browser compatibility?

Nodebox aims for maximum browser compatibility. Although some issues might be expected on old browser versions, Nodebox runs without any problems on the latest version of WebKit (Safari, and any iOS browser), Blink (Microsoft Edge, Brave, and Chrome), and Gecko (Firefox) based browsers.

If you find any issues, please don't hesitate to contact us.

How to load private dependencies?

This feature is currently under development. Although we can't make any promises about when we're going to launch this feature, this is a high priority for the team to make it available for everyone.

How does the Nodebox compare to WebContainers?

While both Nodebox and WebContainers allow running Node.js on the browser, they have several fundamental differences:

*   Nodebox runs on any browser because it was built from the ground up with cross-browser support in mind, avoiding modern features like SharedArrayBuffer.
*   Nodebox does not have an install/setup step, making it faster to boot up. It installs node\_modules in the background.
*   Nodebox uses an internal dependency manager that is fine-tuned to deliver optimal initial load time by utilizing dependency caching via [Sandpack CDN](https://github.com/codesandbox/sandpack-cdn).
*   Nodebox tends to use slightly more memory when multiple processes/workers are involved. Unfortunately, this is a trade-off for cross-browser support as the only way to optimize this is by using SharedArrayBuffers.
*   Nodebox does not support synchronous cross-process communication as this would require Atomics and SharedArrayBuffers.
*   Nodebox does not emulate Node.js's event loop, resulting in processes needing to be exited manually using process.exit() or by stopping the shell.
*   Nodebox is not feature complete yet, some API's are still missing: async\_hooks, vm, worker\_threads and probably some more.

Is Nodebox open-source?

While unfortunately we are not open-sourcing Nodebox for a variety of reasons, some of which are outside of our control, we believe this technology may be the future of improved DX. So, we will continue to explore whether we can open-source it in the future.

I cannot run Nodebox on Brave or "The user denied permission to use Service Worker."

Brave has a few additional restrictions you need manually to disable to make the Service Worker available.

*   Go to brave://settings/cookies
*   Click on "Add" to insert one more option under "Sites that can always use cookies"
*   Add the URL of the page where you're trying to access the Sandpack or Nodebox playground.

## Runtime sandboxes[](#runtime-sandboxes)

How to load private dependencies?

Read the following [guide](/docs/guides/private-packages).

How to load local dependencies?

Currently, Sandpack doesn’t have a way to consume local dependencies, because the bundler host is shared with all Sandpack consumers' apps. However, you can pass local dependencies just like a regular file or using the external resource API:

Editable example

import { Sandpack } from "@codesandbox/sandpack-react";

export default () \=> {
  return (
    <Sandpack
      files\={{
        "/App.js": \`import { hello } from "fake-library";

export default () => hello("World");
\`,
        "/node\_modules/fake-library/package.json": JSON.stringify({
  name: "fake-library",
  main: "./index.js",
}),
        "/node\_modules/fake-library/index.js": \`module.exports = {
  hello: (name) => "Hello " + name
}\`,
      }}
      template\="react"
    />
  )
}

Preview

  
  

How to highlight TypeScript errors in the editor?

Currently, Sandpack doesn't officially support any kind of language server to provide a way to highlight errors in the SandpackCodeEditor. However, there is an [active discussion](https://github.com/codesandbox/sandpack/discussions/237) on how to make it work, with some examples and CodeMirror documentation references on how to implement it.

Why is the bundler hosted externally (iframe) and not a simple JavaScript module?

There are a few reasons for hosting the bundler like this, as opposed to having it exported as library code. See further details in our [client documentation](/docs/advanced-usage/client#why).

[Community](/docs/resources/community "Community")[v1.x](/docs/resources/migration-guide/v1 "v1.x")


--- 
## 📘 章节: Migration guide v1.x
**原文地址:** https://sandpack.codesandbox.io/docs/resources/migration-guide/v1

# Migration guide v1.x

We're excited to announce a major release of Sandpack! It includes many feature requests and a ton of improvements to the developer experience. Here are a few highlights:

*   Improve SSR support.
*   Fresh design and new semantic UI tokens.
*   Introduce the SandpackFileExplorer component.
*   Improvements to the surface API.

## New features[](#new-features)

### SSR support[](#ssr-support)

Sandpack uses [stitches/core](https://stitches.dev/) under the hood to generate and dedupe theme variation, ensuring a consistent and lightweight CSS output. To retrieve its style values, use the following guide to get the output in the SSR:

```
import { getSandpackCssText } from "@codesandbox/sandpack-react";
 
// SSR template
<style
  dangerouslySetInnerHTML={{ __html: getSandpackCssText() }}
  id="sandpack"
/>;
```

For further clarity, take a look at our [examples](https://github.com/codesandbox/sandpack/tree/main/examples).

### SandpackFileExplorer[](#sandpackfileexplorer)

We heard you, and now Sandpack has a new component to navigate through files:

Directorypublic

Fileindex.html

FileApp.jsFileindex.jsFilepackage.jsonFilestyles.css

export default function App() {
  return <h1\>Hello world</h1\>
}

[Open on CodeSandboxOpen Sandbox](https://codesandbox.io/api/v1/sandboxes/define?undefined&environment=create-react-app "Open in CodeSandbox")

### Theme package[](#theme-package)

To reduce the bundle size of the main package and make it possible for the community to contribute custom Sandpack themes with ease, we have detached the themes.

So themes won't be available anymore through the @codesandbox/sandpack-react package but instead through @codesandbox/sandpack-themes.

For example:

import { Sandpack } from "@codesandbox/sandpack-react";
import { githubLight, sandpackDark } from "@codesandbox/sandpack-themes";

export default function App() {
  return (
    <Sandpack 
      theme\={githubLight}
    />
  );
}

[Open on CodeSandboxOpen Sandbox](https://codesandbox.io/api/v1/sandboxes/define?undefined&environment=create-react-app "Open in CodeSandbox")

Sandpack still offers a set of predefined options:

```
<Sandpack
  theme="auto" // prefer color scheme sensitive
/>
```

  
  

But individual values can be passed to customize the style of your Sandpack instance:

import { Sandpack } from "@codesandbox/sandpack-react";
import { githubLight } from "@codesandbox/sandpack-themes";

export default function App() {
  return (
    <Sandpack 
      theme\={{
        ...githubLight,
        colors: {
          accent: "rebeccapurple",
        },
        syntax: {
          tag: "#006400",
          string: "rgb(255, 165, 0)",
          plain: "tomato",
        },
      }}
    />
  );
}

[Open on CodeSandboxOpen Sandbox](https://codesandbox.io/api/v1/sandboxes/define?undefined&environment=create-react-app "Open in CodeSandbox")

### Fresh design[](#fresh-design)

We took this chance to rethink how Sandpack should fit on your website. Our amazing design team at CodeSandbox challenged themselves to come up with a solution that would fit in different layouts and contexts, but still be accessible and customizable.

As a result, we created a new set of themes, icons, design tokens, and components from scratch.

import "./styles.css";

document.getElementById("app").innerHTML = \`
<h1>Hello world</h1>
\`;

[Open on CodeSandboxOpen Sandbox](https://codesandbox.io/api/v1/sandboxes/define?undefined&environment=parcel "Open in CodeSandbox")

### All props are type-safe[](#all-props-are-type-safe)

From now on, files , visibleFiles and activeFile are type-safe:

#### Additional highlights[](#additional-highlights)

*   New React template: supports v18.
*   Fix mismatch id from server to client on the SandpackCodeEditor component.
*   Getting ready to support a new feature to load sandboxes from [CodeSandbox](https://codesandbox.io) 👀.
*   Fix inconsistency between the dependencies prop and the package.json file.
*   SandpackProvider API: it fixes a few inconsistencies, which used to lead to very common mistakes. From now on, it's very similar to the Sandpack API, with some exceptions.
*   Improve error message descriptions.

## Breaking changes[](#breaking-changes)

*   SandpackRunner has been deprecated because the same result can be achieved using the SandpackPreview component.
*   customSetup.main has been deprecated due to redundancy; use options.activeFile instead.
*   customSetup.files has been deprecated due to redundancy; use files instead.
*   options.openPaths has been deprecated; use options.visibleFiles instead.
*   Replaced the customStyle prop with style.
*   Deprecated viewportSize and viewportOrientation from the SandpackPreview component.
*   Deprecated theme on SandpackLayout; set the theme property on SandpackProvider instead.
*   SandpackLayout no longer renders ClasserProvider and SandpackThemeProvider, all context is rendered on SandpackProvider.

### **Migration guide**[](#migration-guide)

**Surface API: Sandpack**

```
// Before
<Sandpack
  customSetup={{ files: { "/src/App.vue": "" }, main: "/src/App.vue" }}
  template="vue"
/>
```

```
// Now
<Sandpack
  files={{ "/src/App.vue": "" }}
  options={{ activeFile: "/src/App.vue" }}
  template="vue"
/>
```

**Surface API: SandpackProvider**

```
// Before
<SandpackProvider
  activePath="/src/App.vue"
  customSetup={{ files: { "/src/App.vue": "" }, dependencies: {} }}
  template="vue"
  openPaths={["/src/App.vue"]}
/>
```

```
// Now
<SandpackProvider
  customSetup={{ dependencies: {} }}
  files={{ "/src/App.vue": "" }}
  options={{
    activeFile: "/src/App.vue", // used to be activePath
    visibleFiles: ["/src/App.vue"], // used to be openPaths
  }}
  template="vue"
/>
```

**Surface API: common components**

```
// Before
<SandpackStack customStyle={customStyle} />
```

```
// Now
<SandpackStack style={customStyle} />
```

**Theme prop**

```
// Before
<Sandpack theme="github-light" />
```

```
// Now
import { githubLight } from "@codesandbox/sandpack-themes";
 
<Sandpack theme={githubLight} />;
```

**Theme provider**

```
// Before
<SandpackProvider>
  <SandpackLayout theme="github-light">...</SandpackLayout>
</SandpackProvider>
```

```
// Now
<SandpackProvider theme="github-light">
  <SandpackLayout>...</SandpackLayout>
</SandpackProvider>
```

**New theme tokens**

We created a few new additional tokens and replaced some existing ones. So previous schemas might need some updates. See a list of schema changes below.

How to read: \[from key name\] → \[to key name\]

*   palette → colors
    *   activeText → hover
    *   defaultText → clickable
    *   inactiveText → surface2
    *   inactiveText → disabled
    *   defaultBackground → surface1
    *   new → surface3
    *   accent → accent
    *   errorForeground → error
    *   errorBackground → errorSurface
*   typography → font
    *   bodyFont → body
    *   monoFont → mono
    *   fontSize → size
    *   lineHeight → lineHeight

[FAQ](/docs/resources/faq "FAQ")[v2.x](/docs/resources/migration-guide/v2 "v2.x")


--- 
## 📘 章节: Migration guide v2.x
**原文地址:** https://sandpack.codesandbox.io/docs/resources/migration-guide/v2

# Migration guide v2.x

  

Sandpack 2.0 introduces one of the most exciting features we've ever launched: Nodebox integration - a fast runtime Node.js environment inside of Sandpack:

*   Run Vite-based templates, Next.js & more.
*   Lazily load bundler (runtime or Nodebox) as needed.

Fortunately, @codesandbox/sandpack-react doesn't introduce any breaking changes for this release. However, in order to support a new kind of Sandpack bundler (Nodebox), @codesandbox/sandpack-client contains a few breaking changes, and we took this chance to rename some API methods.

## @codesandbox/sandpack-client[](#codesandboxsandpack-client)

### Main entry point[](#main-entry-point)

Sandpack Client used to export a single entry point to mound a new client. However, 2.0 introduced one more type of environment (Nodebox) and we wanted to provide an interface that could lazily load each environment as needed.

To migrate to the latest version of sandpack-client, you will need to make the following changes:

#### Importing the loadSandpackClient function[](#importing-the-loadsandpackclient-function)

Before, you would import the SandpackClient class like this:

```
import { SandpackClient } from "@codesandbox/sandpack-client";
```

Now, you will need to import the loadSandpackClient function instead:

```
import { loadSandpackClient } from "@codesandbox/sandpack-client";
 
const main = async () => {
  const client = await loadSandpackClient(myIframe, myFiles, myOptions);
  
  // The rest of your code can stay the same
  client.updateSandbox();
}
```

**Consuming clients independently**

If you want to skip the lazy loading step and consume the clients independently, you can import the SandpackRuntime and SandpackNode classes directly:

```
import { SandpackRuntime } from "@codesandbox/sandpack-client/clients/runtime";
import { SandpackNode } from "@codesandbox/sandpack-client/clients/node";
 
const runtimeClient = new SandpackRuntime(/* arguments */)
const nodeClient = new SandpackNode(/* arguments */)
```

### Deprecated APIs[](#deprecated-apis)

**Template**

The vue template has been deprecated in order to use the latest Vue version, which used to be on vue3 template. In other words, the current vue template is now using Vue 3, and Vue 2 has been removed from the template list.

### API renaming[](#api-renaming)

Two methods have been renamed in the latest version of sandpack-client:

*   updateSandbox is now called updatePreview
*   cleanup is now called destroy

To migrate your code to the latest version, you will need to update any calls to these methods like this:

```
// Before
client.updateSandbox();
client.cleanup();
 
// Now
client.updatePreview();
client.destroy();
```

After making these changes, your code should be compatible with the latest version of sandpack-client.

[v1.x](/docs/resources/migration-guide/v1 "v1.x")[Overview](/docs/architecture/overview "Overview")


--- 
## 📘 章节: Overview
**原文地址:** https://sandpack.codesandbox.io/docs/architecture/overview

# Overview

1.  Sandpack React

*   <Sandpack /> component initializes
*   Manages React integration & UI state

2.  Sandpack Clinet

*   loadSandpackClient() selects appropriate client type (VM/Runtime/Static/Node)
*   Creates sandbox context from files, template, and dependencies

3.  Bundler

*   Processes sandbox setup
*   Handles code bundling
*   Returns updates to client

  

sequenceDiagram autonumber participant R as Sandpack-react participant C as Sandpack-client Note left of R: <Sandpack /> Note right of C: loadSandpackClient(...) Note right of C: Depending on the template/env<br/>loadSandpackClient will return a<br />vm, runtime, static or node client Note right of C: sandpack-client/clients/index.ts R->>+C: Get sandbox context Note over R,C: Based on files, template, and deps, <br/> will be create a SandpackContextInfo. Note right of R: getSandpackStateFromProps(...) C->>-R: New client instance Note left of R: new SandpackClient() create participant B as Bundler C->>+B: Dispatch sandbox setup B->>+C: Messages with updates Note left of R: Once it's done, show <br/>iframe with preview C->>-R: Done C->>+R: Dispatch sandbox setup

[v2.x](/docs/resources/migration-guide/v2 "v2.x")[Private Packages](/docs/architecture/private-packages "Private Packages")
