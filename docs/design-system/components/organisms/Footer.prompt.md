Footer — the global site footer organism: logo + tagline + link columns + a legal/trust row.

```jsx
<Footer logoSrc="/assets/brand/petnalia-horizontal.png"
  columns={[
    { title: "Produto", links: [{label:"Buscar vets"},{label:"Como funciona"}] },
    { title: "Para vets", links: [{label:"Seja parceiro"},{label:"Entrar"}] },
    { title: "Suporte", links: [{label:"Ajuda"},{label:"Contato"}] },
  ]}
  social={[{icon:"message-circle",label:"WhatsApp"},{icon:"phone",label:"Telefone"}]} />
```

Columns auto-fit responsively and collapse to a stack on mobile.
