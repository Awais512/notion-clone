"use client";
import { type EdgeStoreRouter } from "@/app/api/egdestore/[...edgestore]/route";
import { createEdgeStoreProvider } from "@edgestore/react";
const { EdgeStoreProvider, useEdgeStore } =
  createEdgeStoreProvider<EdgeStoreRouter>();
export { EdgeStoreProvider, useEdgeStore };
