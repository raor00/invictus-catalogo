import React from "react"
import { PublicCatalogGrid } from "@/components/PublicCatalogGrid"

export default async function PublicCatalogPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { category } = await searchParams;
    const isParts = category === "parts";

    return (
        <PublicCatalogGrid isParts={isParts} />
    )
}
