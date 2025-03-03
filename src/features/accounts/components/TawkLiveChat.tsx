"use client"

import { useEffect } from "react";

export default function TawkLiveChat() {
  useEffect(() => {

    //@ts-ignore
    var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
    (function () {
      var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/67c4b8d6c8c9601909568332/1ilc741to';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      //@ts-ignore
      s0.parentNode.insertBefore(s1, s0);
    })();
  })
  return null
}
