Header — the global navigation organism: logo + nav links + location + notifications + Avatar. Sticky and blurred at `--z-sticky`.

```jsx
<Header logoSrc="/assets/brand/petnalia-horizontal.png"
  links={[{id:"home",label:"Início"},{id:"search",label:"Buscar vets"}]}
  active="home" city="São Paulo"
  user={{ name: "Camila Rocha", status: "online" }} unread
  onNav={navigate} onMenu={openDrawer} />
```

Pass `user` for the signed-in state (bell + avatar) or omit for an "Entrar" button. `onMenu` adds a mobile menu button (show it under md via CSS). Composes Avatar + Icon + Button atoms.
