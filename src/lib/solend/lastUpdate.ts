// @ts-ignore
import BufferLayout from "buffer-layout";
import {uint64} from "./layout";

export const LastUpdateLayout = BufferLayout.struct(
  [uint64("slot"), BufferLayout.u8("stale")],
  "lastUpdate"
);