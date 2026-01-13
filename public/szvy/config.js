// This file overwrites the stock UV config.js

self.__uv$config = {
  prefix: "/szvy/szvy/",
  bare: "/bare/",
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/szvy/handler.js",
  client: "/szvy/client.js",
  bundle: "/szvy/bundle.js",
  config: "/szvy/config.js",
  sw: "/szvy/rizz.sw.js",
};
