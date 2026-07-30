"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import RoleGuard from "@/components/auth/roleguard";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Check, PackageCheck, X, ShoppingCart } from "lucide-react";

type Request = {
    id: number;
    item: number | null;
    item_name: string;
    new_item_name: string | null;
    quantity: number;
    reason: string;
    status: string;
    kitchen_name: string | null;
    new_item_unit: string;
    new_item_package_size: string;
};

type ItemInfo = {
    name: string;
    unit: string;
    price_per_unit: number | null;
    management_stock: number;
};

type GroupedRequests = {
    kitchen_name: string;
    requests: Request[];
};

type StockCheck = {
    isNew: boolean;
    hasEnough: boolean;
    currentStock: number;
};

const STATUS_BADGE_STYLES: Record<string, string> = {
    approved: "bg-green-100 text-green-700 hover:bg-green-100",
    pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    rejected: "bg-red-100 text-red-700 hover:bg-red-100",
};

const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

const getBadgeStyle = (status: string) =>
    STATUS_BADGE_STYLES[status] ?? "bg-gray-100 text-gray-700 hover:bg-gray-100";

const getItemLabel = (req: Request) =>
    (req.item_name ?? req.new_item_name ?? "") +
    (req.new_item_package_size
        ? ` (${parseFloat(String(req.new_item_package_size))} ${req.new_item_unit})`
        : "");

function StockCheckBadge({ check }: { check: StockCheck }) {
    if (check.isNew) {
        return <span className="text-xs text-gray-400 italic">New item</span>;
    }
    if (check.hasEnough) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                <PackageCheck className="h-3.5 w-3.5" />
                In stock ({check.currentStock})
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
            <ShoppingCart className="h-3.5 w-3.5" />
            Need to purchase ({check.currentStock} on hand)
        </span>
    );
}

function RequestActions({
    req,
    onApprove,
    onFulfill,
    onReject,
    size = "default",
}: {
    req: Request;
    onApprove: (id: number) => void;
    onFulfill: (id: number) => void;
    onReject: (id: number) => void;
    size?: "default" | "sm";
}) {
    if (req.status !== "pending") return null;

    return (
        <>
            <Button size={size} onClick={() => onApprove(req.id)}>
                <Check className="h-4 w-4 mr-1" />
                Purchase
            </Button>
            <Button size={size} variant="secondary" onClick={() => onFulfill(req.id)}>
                <PackageCheck className="h-4 w-4 mr-1" />
                Use Stock
            </Button>
            <Button size={size} variant="destructive" onClick={() => onReject(req.id)}>
                <X className="h-4 w-4 mr-1" />
                Reject
            </Button>
        </>
    );
}

export default function RequestListPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [itemInfoMap, setItemInfoMap] = useState<Record<number, ItemInfo>>({});
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [kitchenFilter, setKitchenFilter] = useState("all");

    const fetchRequests = async () => {
        const res = await API.get("/requests/");
        setRequests(res.data);
    };

    const fetchStock = async () => {
        try {
            const res = await API.get("/inventory/with-stock/");
            const map: Record<number, ItemInfo> = {};
            res.data.forEach((item: any) => {
                map[item.id] = {
                    name: item.name,
                    unit: item.unit,
                    price_per_unit: item.price_per_unit ?? null,
                    management_stock: item.management_stock,
                };
            });
            setItemInfoMap(map);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchRequests(), fetchStock()]).finally(() => setLoading(false));
    }, []);

    const approve = async (id: number) => {
        try {
            await API.post(`/requests/${id}/approve/`);
            await Promise.all([fetchRequests(), fetchStock()]);
        } catch (err: any) {
            alert(err?.response?.data?.error ?? "Failed to approve");
        }
    };

    const fulfillFromStock = async (id: number) => {
        try {
            await API.post(`/requests/${id}/fulfill_from_stock/`);
            await Promise.all([fetchRequests(), fetchStock()]);
        } catch (err: any) {
            alert(err?.response?.data?.error ?? "Failed to fulfill from stock");
        }
    };

    const reject = async (id: number) => {
        try {
            await API.post(`/requests/${id}/reject/`);
            await fetchRequests();
        } catch (err: any) {
            alert(err?.response?.data?.error ?? "Failed to reject");
        }
    };

    const getStockCheck = (req: Request): StockCheck => {
        if (req.item == null) {
            return { isNew: true, hasEnough: false, currentStock: 0 };
        }
        const currentStock = itemInfoMap[req.item]?.management_stock ?? 0;
        return { isNew: false, hasEnough: currentStock >= req.quantity, currentStock };
    };

    // Kitchen options built from the full (unfiltered) request list, so the
    // dropdown doesn't shrink as the person filters.
    const kitchenOptions = useMemo(() => {
        const names = new Set(requests.map((r) => r.kitchen_name ?? "Unassigned"));
        return Array.from(names).sort((a, b) => {
            if (a === "Unassigned") return 1;
            if (b === "Unassigned") return -1;
            return a.localeCompare(b);
        });
    }, [requests]);

    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const matchesSearch = getItemLabel(req)
                .toLowerCase()
                .includes(search.trim().toLowerCase());
            const matchesStatus = statusFilter === "all" || req.status === statusFilter;
            const matchesKitchen =
                kitchenFilter === "all" || (req.kitchen_name ?? "Unassigned") === kitchenFilter;
            return matchesSearch && matchesStatus && matchesKitchen;
        });
    }, [requests, search, statusFilter, kitchenFilter]);

    const groupedRequests: GroupedRequests[] = useMemo(() => {
        const groups = new Map<string, Request[]>();

        for (const req of filteredRequests) {
            const key = req.kitchen_name ?? "Unassigned";
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(req);
        }

        return Array.from(groups.entries())
            .sort(([a], [b]) => {
                if (a === "Unassigned") return 1;
                if (b === "Unassigned") return -1;
                return a.localeCompare(b);
            })
            .map(([kitchen_name, requests]) => ({ kitchen_name, requests }));
    }, [filteredRequests]);

    // The PDF now reflects whatever's currently filtered on screen (search,
    // kitchen, status) -- so filtering down to one kitchen or searching for
    // one item and hitting download gives just that slice.
    const downloadPdf = () => {
        const pendingRequests = filteredRequests.filter((r) => r.status === "pending");

        // Consolidate existing-item demand across ALL kitchens first, so
        // stock is checked against combined demand rather than once per
        // request. Without this, two kitchens each requesting 5 units of an
        // item with 8 in stock would both individually show "in stock" even
        // though 10 are actually needed against 8 available.
        const existingDemand = new Map<number, { totalRequested: number }>();
        const newItemDemand = new Map<string, { name: string; unit: string; totalRequested: number }>();

        pendingRequests.forEach((req) => {
            if (req.item != null) {
                const entry = existingDemand.get(req.item) ?? { totalRequested: 0 };
                entry.totalRequested += req.quantity;
                existingDemand.set(req.item, entry);
            } else {
                const key = `${req.new_item_name ?? ""}|${req.new_item_unit ?? ""}`;
                const entry = newItemDemand.get(key) ?? {
                    name: getItemLabel(req),
                    unit: req.new_item_unit ?? "",
                    totalRequested: 0,
                };
                entry.totalRequested += req.quantity;
                newItemDemand.set(key, entry);
            }
        });

        type PurchaseLine = {
            name: string;
            unit: string;
            totalRequested: number;
            stock: number;
            toPurchase: number;
            estimatedCost: number | null;
        };

        const existingLines: PurchaseLine[] = Array.from(existingDemand.entries())
            .map(([itemId, demand]) => {
                const info = itemInfoMap[itemId];
                const stock = info?.management_stock ?? 0;
                const toPurchase = Math.max(demand.totalRequested - stock, 0);
                return {
                    name: info?.name ?? `Item #${itemId}`,
                    unit: info?.unit ?? "",
                    totalRequested: demand.totalRequested,
                    stock,
                    toPurchase,
                    estimatedCost:
                        info?.price_per_unit != null ? toPurchase * info.price_per_unit : null,
                };
            })
            .filter((line) => line.toPurchase > 0);

        const newLines: PurchaseLine[] = Array.from(newItemDemand.values()).map((demand) => ({
            name: demand.name,
            unit: demand.unit,
            totalRequested: demand.totalRequested,
            stock: 0,
            toPurchase: demand.totalRequested,
            estimatedCost: null,
        }));

        const purchaseLines = [...existingLines, ...newLines];
        const grandTotal = purchaseLines.reduce(
            (sum, l) => sum + (l.estimatedCost ?? 0),
            0
        );
        const hasAnyCost = purchaseLines.some((l) => l.estimatedCost != null);

        const doc = new jsPDF();
        let y = 14;

        doc.setFontSize(16);
        doc.text("Shopping Checklist", 14, y);
        y += 6;
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`Generated: ${new Date().toLocaleString("en-MY")}`, 14, y);
        y += 8;

        // Consolidated purchase list -- what to actually buy, quantities
        // netted against current stock, deduplicated across kitchens.
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("To Purchase (all kitchens combined)", 14, y);
        y += 4;

        if (purchaseLines.length === 0) {
            doc.setFontSize(10);
            doc.setTextColor(120);
            doc.text("Nothing to purchase -- all pending requests can be filled from stock.", 14, y + 4);
            y += 12;
        } else {
            autoTable(doc, {
                startY: y,
                head: hasAnyCost
                    ? [["\u2611", "Item", "Requested", "In Stock", "To Buy", "Unit", "Est. Cost"]]
                    : [["\u2611", "Item", "Requested", "In Stock", "To Buy", "Unit"]],
                body: purchaseLines.map((l) =>
                    hasAnyCost
                        ? [
                              "",
                              l.name,
                              String(l.totalRequested),
                              String(l.stock),
                              String(l.toPurchase),
                              l.unit,
                              l.estimatedCost != null ? `RM ${l.estimatedCost.toFixed(2)}` : "-",
                          ]
                        : ["", l.name, String(l.totalRequested), String(l.stock), String(l.toPurchase), l.unit]
                ),
                theme: "grid",
                styles: { fontSize: 10 },
                headStyles: { fillColor: [40, 40, 40] },
                columnStyles: { 0: { cellWidth: 8, halign: "center" } },
                foot: hasAnyCost
                    ? [["", "", "", "", "", "Total", `RM ${grandTotal.toFixed(2)}`]]
                    : undefined,
                footStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: "bold" },
            });

            y = (doc as any).lastAutoTable.finalY + 12;
        }

        // Per-kitchen breakdown -- who asked for what, for traceability.
        // Quantities here are each kitchen's original request, not netted
        // against stock (that netting only makes sense at the combined level).
        groupedRequests.forEach((group) => {
            const kitchenPending = group.requests.filter((r) => r.status === "pending");
            if (kitchenPending.length === 0) return;

            if (y > 260) {
                doc.addPage();
                y = 14;
            }

            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(group.kitchen_name, 14, y);
            y += 4;

            autoTable(doc, {
                startY: y,
                head: [["Item", "Qty", "Reason"]],
                body: kitchenPending.map((r) => [getItemLabel(r), String(r.quantity), r.reason || "-"]),
                theme: "grid",
                styles: { fontSize: 10 },
                headStyles: { fillColor: [90, 90, 90] },
            });

            y = (doc as any).lastAutoTable.finalY + 10;
        });

        doc.save(`shopping-checklist-${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <RoleGuard allowedRoles={["management"]}>
            <div className="space-y-8">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Inventory Requests</h1>
                    <div className="text-right">
                        <Button onClick={downloadPdf} variant="outline">
                            <Download className="h-4 w-4 mr-1.5" />
                            Download Checklist PDF{" "}
                            {(search || statusFilter !== "all" || kitchenFilter !== "all") && "(filtered)"}
                        </Button>
                        {statusFilter !== "all" && statusFilter !== "pending" && (
                            <p className="mt-1 text-xs text-gray-400">
                                Only pending requests generate a purchase list -- the "
                                {STATUS_FILTERS.find((f) => f.value === statusFilter)?.label}" filter
                                will produce an empty checklist.
                            </p>
                        )}
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                            type="text"
                            placeholder="Search item..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />

                        <select
                            value={kitchenFilter}
                            onChange={(e) => setKitchenFilter(e.target.value)}
                            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        >
                            <option value="all">All kitchens</option>
                            {kitchenOptions.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setStatusFilter(f.value)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                    statusFilter === f.value
                                        ? "bg-gray-900 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {!loading && requests.length === 0 && (
                    <p className="text-gray-500">No requests yet.</p>
                )}

                {!loading && requests.length > 0 && groupedRequests.length === 0 && (
                    <p className="text-gray-500">No requests match this filter.</p>
                )}

                {groupedRequests.map((group) => (
                    <div key={group.kitchen_name} className="space-y-3">
                        <h2 className="text-lg font-semibold">{group.kitchen_name}</h2>

                        <Table className="w-full border bg-white hidden md:table">
                            <TableHeader>
                                <TableRow className="bg-gray-100">
                                    <TableHead className="font-bold w-10">No</TableHead>
                                    <TableHead className="font-bold">Item</TableHead>
                                    <TableHead className="font-bold">Quantity</TableHead>
                                    <TableHead className="font-bold">Reason</TableHead>
                                    <TableHead className="font-bold">Stock Check</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="text-center font-bold">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {group.requests.map((req,index) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{index+1}</TableCell>
                                        <TableCell className="font-medium">{getItemLabel(req)}</TableCell>
                                        <TableCell>{req.quantity}</TableCell>
                                        <TableCell className="text-gray-600">{req.reason}</TableCell>
                                        <TableCell>
                                            <StockCheckBadge check={getStockCheck(req)} />
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getBadgeStyle(req.status)}>
                                                {req.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <div className="flex gap-2 justify-center flex-wrap">
                                                <RequestActions
                                                    req={req}
                                                    onApprove={approve}
                                                    onFulfill={fulfillFromStock}
                                                    onReject={reject}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="grid grid-cols-1 gap-3 md:hidden">
                            {group.requests.map((req) => (
                                <Card key={req.id}>
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="font-semibold">{getItemLabel(req)}</p>
                                            <Badge className={getBadgeStyle(req.status)}>
                                                {req.status.toUpperCase()}
                                            </Badge>
                                        </div>

                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>
                                                Quantity:{" "}
                                                <span className="font-medium text-gray-900">{req.quantity}</span>
                                            </p>
                                            <p>Reason: {req.reason}</p>
                                            <StockCheckBadge check={getStockCheck(req)} />
                                        </div>

                                        <div className="flex gap-2 justify-end pt-1 flex-wrap">
                                            <RequestActions
                                                req={req}
                                                onApprove={approve}
                                                onFulfill={fulfillFromStock}
                                                onReject={reject}
                                                size="sm"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </RoleGuard>
    );
}