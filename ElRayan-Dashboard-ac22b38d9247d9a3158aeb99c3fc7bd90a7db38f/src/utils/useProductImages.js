import { useState, useEffect, useCallback } from "react";
import api from "../Api/Api";

// Global memory cache to prevent redundant API calls across page switches
let globalImageCache = null;
let isFetching = false;
let fetchPromise = null;
const fetchedSingleIds = new Set();

const extractImageFromObject = (item) => {
    if (!item) return "";
    let img =
        item.Image ||
        item.image ||
        item.images?.[0]?.attach ||
        item.images?.[0]?.url ||
        (typeof item.images?.[0] === "string" ? item.images[0] : "") ||
        item.attach ||
        item.photo ||
        item.url ||
        item.icon ||
        item.img ||
        item.product_image ||
        item.productImage ||
        item.product?.images?.[0]?.attach ||
        item.product?.images?.[0]?.url ||
        item.product?.Image ||
        item.product?.image ||
        "";
    if (typeof img === "object") {
        img = img.attach || img.url || "";
    }
    return typeof img === "string" ? img : "";
};

export const useProductImages = () => {
    const [imageCache, setImageCache] = useState(() => {
        if (globalImageCache) return globalImageCache;
        try {
            const saved = localStorage.getItem("elrayan_product_images_cache");
            if (saved) {
                globalImageCache = JSON.parse(saved);
                return globalImageCache;
            }
        } catch (e) {
            console.error("Error loading product images cache:", e);
        }
        return {};
    });

    useEffect(() => {
        if (globalImageCache && Object.keys(globalImageCache).length > 0) {
            return;
        }

        if (isFetching && fetchPromise) {
            fetchPromise.then((map) => {
                if (map) setImageCache({ ...map });
            });
            return;
        }

        const fetchAllProductImages = async () => {
            isFetching = true;
            try {
                const map = { ...(globalImageCache || {}) };
                const res = await api.get("/product?limit=1000&sortOrder=ASC&page=1");
                const items = res.data?.data?.items || res.data?.items || Array.isArray(res.data?.data) ? res.data.data : [];
                
                if (Array.isArray(items)) {
                    items.forEach((item) => {
                        const img = extractImageFromObject(item);
                        if (item.id && img) {
                            map[item.id] = img;
                        }
                    });

                    const meta = res.data?.data?.metadata || res.data?.metadata;
                    if (meta && meta.totalPages > 1 && meta.currentPage === 1) {
                        const pagePromises = [];
                        const maxPages = Math.min(meta.totalPages, 10);
                        for (let p = 2; p <= maxPages; p++) {
                            pagePromises.push(
                                api.get(`/product?limit=${meta.itemsPerPage || 100}&sortOrder=ASC&page=${p}`).catch(() => null)
                            );
                        }
                        const responses = await Promise.all(pagePromises);
                        responses.forEach((r) => {
                            const pItems = r?.data?.data?.items || r?.data?.items || [];
                            if (Array.isArray(pItems)) {
                                pItems.forEach((item) => {
                                    const img = extractImageFromObject(item);
                                    if (item.id && img) {
                                        map[item.id] = img;
                                    }
                                });
                            }
                        });
                    }

                    globalImageCache = map;
                    try {
                        localStorage.setItem("elrayan_product_images_cache", JSON.stringify(map));
                    } catch (e) {}
                    setImageCache({ ...map });
                    return map;
                }
            } catch (err) {
                console.error("Failed to load global product images cache:", err);
            } finally {
                isFetching = false;
            }
        };

        fetchPromise = fetchAllProductImages();
    }, []);

    const fetchSingleProduct = useCallback(async (id) => {
        if (!id || fetchedSingleIds.has(id)) return;
        fetchedSingleIds.add(id);
        try {
            const res = await api.get(`/product/${id}`);
            const pData = res.data?.data || res.data || {};
            const imgUrl = extractImageFromObject(pData);
            if (imgUrl) {
                globalImageCache = { ...(globalImageCache || {}), [id]: imgUrl };
                try {
                    localStorage.setItem("elrayan_product_images_cache", JSON.stringify(globalImageCache));
                } catch (e) {}
                setImageCache((prev) => ({ ...prev, [id]: imgUrl }));
            }
        } catch (e) {
            console.error(`Failed to fetch image for product #${id}`, e);
        }
    }, []);

    const getProductImage = useCallback((record) => {
        if (!record) return "";
        
        let img = extractImageFromObject(record);
        const prodId = record.productId || record.product_id || record.product?.id || record.id;

        if (!img && prodId && imageCache[prodId]) {
            img = imageCache[prodId];
        }

        if (!img && prodId && !imageCache[prodId] && !fetchedSingleIds.has(prodId)) {
            fetchSingleProduct(prodId);
        }

        if (!img || typeof img !== "string" || img.trim() === "") return "";

        img = img.trim();

        if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
            return img.replace(/(https?:\/\/[^\/]+)\/+/g, "$1/");
        }
        if (img.includes("imagekit.io") || img.includes("ik.imagekit.io")) {
            const clean = `https://${img.replace(/^https?:\/\//, "").replace(/^\/+/, "")}`;
            return clean.replace(/(https?:\/\/[^\/]+)\/+/g, "$1/");
        }
        if (img.startsWith("/")) {
            return `https://api.elrayan.acwad.tech${img}`.replace(/(https?:\/\/[^\/]+)\/+/g, "$1/");
        }
        return `https://api.elrayan.acwad.tech/${img}`.replace(/(https?:\/\/[^\/]+)\/+/g, "$1/");
    }, [imageCache, fetchSingleProduct]);

    return { imageCache, getProductImage };
};
