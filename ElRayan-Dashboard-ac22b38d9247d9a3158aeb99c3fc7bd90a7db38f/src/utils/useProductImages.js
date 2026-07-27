import { useState, useEffect, useCallback } from "react";
import api from "../Api/Api";

// Global memory cache to prevent redundant API calls across page switches
let globalImageCache = null;
let isFetching = false;
let fetchPromise = null;
const fetchedSingleIds = new Set();

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
        // If we already have a loaded cache in memory, no need to re-fetch immediately
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
                
                // Fetch first batch of products (high limit to get as many as possible)
                const res = await api.get("/product?limit=1000&sortOrder=ASC&page=1");
                if (res.data?.success && res.data?.data?.items) {
                    const items = res.data.data.items;
                    items.forEach((item) => {
                        if (item.id && item.images?.[0]?.attach) {
                            map[item.id] = item.images[0].attach;
                        }
                    });

                    const meta = res.data.data.metadata;
                    // If backend paginated the results, fetch remaining pages in parallel
                    if (meta && meta.totalPages > 1 && meta.currentPage === 1) {
                        const pagePromises = [];
                        const maxPages = Math.min(meta.totalPages, 10); // fetch up to 10 pages securely
                        for (let p = 2; p <= maxPages; p++) {
                            pagePromises.push(
                                api.get(`/product?limit=${meta.itemsPerPage || 100}&sortOrder=ASC&page=${p}`).catch(() => null)
                            );
                        }
                        const responses = await Promise.all(pagePromises);
                        responses.forEach((r) => {
                            if (r && r.data?.success && r.data?.data?.items) {
                                r.data.data.items.forEach((item) => {
                                    if (item.id && item.images?.[0]?.attach) {
                                        map[item.id] = item.images[0].attach;
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
            if (res.data?.success && res.data?.data?.images?.[0]?.attach) {
                const imgUrl = res.data.data.images[0].attach;
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
        
        // Direct fields in record
        let img =
            record.Image ||
            record.image ||
            record.images?.[0]?.attach ||
            record.images?.[0]?.url ||
            record.images?.[0] ||
            record.attach ||
            record.photo ||
            record.url ||
            record.icon ||
            record.img ||
            record.product_image ||
            record.productImage ||
            record.product?.images?.[0]?.attach ||
            record.product?.Image ||
            record.product?.image ||
            "";

        // Check cache if no image field found
        if (!img && record.id && imageCache[record.id]) {
            img = imageCache[record.id];
        }

        // If still no image and we haven't fetched this single ID yet, trigger async single fetch
        if (!img && record.id && !imageCache[record.id] && !fetchedSingleIds.has(record.id)) {
            fetchSingleProduct(record.id);
        }

        if (!img) return "";

        if (typeof img === "string") {
            if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
                return img;
            }
            if (img.startsWith("/")) {
                return `https://api.elrayan.acwad.tech${img}`;
            }
            return `https://api.elrayan.acwad.tech/${img}`;
        }
        return "";
    }, [imageCache, fetchSingleProduct]);

    return { imageCache, getProductImage };
};
