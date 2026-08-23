"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api1";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TableRow, TableCell } from "@/components/ui/table";
import RoleGuard from "@/components/auth/roleguard";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Check, PackageCheck, X, ShoppingCart, MoreVertical } from "lucide-react";
import type { Request, ItemInfo, GroupedRequests, StockCheck } from "@/types/kitchen";
import PageHeader from "@/components/ui/page-header";
import DataTable from "@/components/table";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type ItemInfoWithPackage = ItemInfo & { package_size?: number | string | null };
type RequestWithFulfillment = Request & { fulfilled_from_stock?: boolean };

const STATUS_BADGE_STYLES: Record<string, string> = {
    approved: "bg-green-100 text-green-700 hover:bg-green-100",
    pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    rejected: "bg-red-100 text-red-700 hover:bg-red-100",
};

const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "pending", label: "Menunggu" },
    { value: "approved", label: "Diluluskan" },
    { value: "rejected", label: "Ditolak" },
];

const REQUEST_COLUMNS = [
    { key: "no", label: "Bil.", className: "w-10" },
    { key: "item", label: "Item" },
    { key: "qty", label: "Kuantiti" },
    { key: "reason", label: "Sebab" },
    { key: "stock", label: "Stok Check" },
    { key: "status", label: "Status" },
    { key: "action", label: "Tincakan", align: "center" as const },
];

const getBadgeStyle = (status: string) =>
    STATUS_BADGE_STYLES[status] ?? "bg-gray-100 text-gray-700 hover:bg-gray-100";

const getItemLabel = (req: Request) =>
    (req.item_name ?? req.new_item_name ?? "") +
    (req.new_item_package_size
        ? ` (${parseFloat(String(req.new_item_package_size))} ${req.new_item_unit})`
        : "");

const getBaseName = (req: Request) => req.item_name ?? req.new_item_name ?? "-";

const getPackageSizeDisplay = (
    req: Request,
    itemInfoMap: Record<number, ItemInfoWithPackage>
): string => {
    if (req.item != null) {
        const size = itemInfoMap[req.item]?.package_size;
        return size != null && size !== "" ? String(parseFloat(String(size))) : "-";
    }
    return req.new_item_package_size ? String(parseFloat(String(req.new_item_package_size))) : "-";
};

const getUnitDisplay = (
    req: Request,
    itemInfoMap: Record<number, ItemInfoWithPackage>
): string => {
    if (req.item != null) {
        return itemInfoMap[req.item]?.unit ?? "-";
    }
    return req.new_item_unit ?? "-";
};

function StockCheckBadge({ check }: { check: StockCheck }) {
    if (check.isNew) {
        return <span className="text-xs text-gray-400 italic">Item Baru</span>;
    }
    if (check.hasEnough) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                <PackageCheck className="h-3.5 w-3.5" />
                Dalam stok ({check.currentStock})
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
            <ShoppingCart className="h-3.5 w-3.5" />
            Perlu membeli ({check.currentStock} dalam gudang)
        </span>
    );
}

function getActionInfo(req: RequestWithFulfillment) {
    if (req.status === "rejected") {
        return { label: "Ditolak", icon: X, className: "text-red-600" };
    }
    if (req.status === "approved") {
        if (req.fulfilled_from_stock) {
            return { label: "Transfer dari Stok", icon: PackageCheck, className: "text-blue-600" };
        }
        return { label: "Pembelian", icon: ShoppingCart, className: "text-green-700" };
    }
    return null;
}

function ActionStatus({ req }: { req: RequestWithFulfillment }) {
    const info = getActionInfo(req);
    if (!info) return null;
    const Icon = info.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${info.className}`}>
            <Icon className="h-3.5 w-3.5" />
            {info.label}
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
    if (req.status !== "pending") {
        return <ActionStatus req={req} />;
    }

    return (
        <div className="flex items-center gap-1.5">
            <Button size={size} onClick={() => onApprove(req.id)}>
                <Check className="h-4 w-4 mr-1" />
                Pembelian
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Lagi tindakan</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onFulfill(req.id)}>
                        <PackageCheck className="h-4 w-4 mr-2" />
                        Gunakan Stok
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onReject(req.id)}
                        className="text-red-600 focus:text-red-600"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Tolak
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function MobileRequestActions({
    req,
    onApprove,
    onFulfill,
    onReject,
}: {
    req: Request;
    onApprove: (id: number) => void;
    onFulfill: (id: number) => void;
    onReject: (id: number) => void;
}) {
    if (req.status !== "pending") {
        return <ActionStatus req={req} />;
    }

    return (
        <div className="flex items-center gap-2 w-full">
            <Button size="sm" className="flex-1" onClick={() => onApprove(req.id)}>
                <Check className="h-4 w-4 mr-1" />
                Pembelian
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline" className="h-9 w-9 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Lagi tindakan</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onFulfill(req.id)}>
                        <PackageCheck className="h-4 w-4 mr-2" />
                        Gunakan Stok
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onReject(req.id)}
                        className="text-red-600 focus:text-red-600"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Tolak
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default function RequestListPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [itemInfoMap, setItemInfoMap] = useState<Record<number, ItemInfoWithPackage>>({});
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [kitchenFilter, setKitchenFilter] = useState("all");

    const fetchRequests = async () => {
        const res = await API.get("/requests/");
        setRequests(res.data.results ?? res.data);
    };

    const fetchStock = async () => {
        try {
            const res = await API.get("/inventory/with-stock/");
            const map: Record<number, ItemInfoWithPackage> = {};
            res.data.forEach((item: any) => {
                map[item.id] = {
                    name: item.name,
                    unit: item.unit,
                    price_per_unit: item.price_per_unit ?? null,
                    management_stock: item.management_stock,
                    package_size: item.package_size ?? item.size_per_package ?? item.pack_size ?? null,
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

    const downloadPdf = () => {
        const pendingRequests = filteredRequests.filter((r) => r.status === "pending");
        const existingDemand = new Map<number, { totalRequested: number }>();
        const newItemDemand = new Map<
            string,
            { name: string; unit: string; packageSize: string; totalRequested: number }
        >();

        pendingRequests.forEach((req) => {
            if (req.item != null) {
                const entry = existingDemand.get(req.item) ?? { totalRequested: 0 };
                entry.totalRequested += req.quantity;
                existingDemand.set(req.item, entry);
            } else {
                const key = `${req.new_item_name ?? ""}|${req.new_item_unit ?? ""}`;
                const entry = newItemDemand.get(key) ?? {
                    name: getBaseName(req),
                    unit: req.new_item_unit ?? "",
                    packageSize: getPackageSizeDisplay(req, itemInfoMap),
                    totalRequested: 0,
                };
                entry.totalRequested += req.quantity;
                newItemDemand.set(key, entry);
            }
        });

        type PurchaseLine = {
            name: string;
            unit: string;
            packageSize: string;
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
                    packageSize:
                        info?.package_size != null && info.package_size !== ""
                            ? String(parseFloat(String(info.package_size)))
                            : "-",
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
            packageSize: demand.packageSize,
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
        doc.text("Shopping Checklist DSM@UMS", 14, y);
        y += 6;
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`Generated: ${new Date().toLocaleString("en-MY")}`, 14, y);
        y += 8;
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("To Purchase (all kitchens combined) DSM@UMS", 14, y);
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
                    ? [["\u2611", "Item", "Saiz Pek", "Unit", "Diminta", "Stok", "Beli", "Anggaran Kos"]]
                    : [["\u2611", "Item", "Saiz Pek", "Unit", "Diminta", "Stok", "Beli"]],
                body: purchaseLines.map((l) =>
                    hasAnyCost
                        ? [
                              "",
                              l.name,
                              l.packageSize,
                              l.unit,
                              String(l.totalRequested),
                              String(l.stock),
                              String(l.toPurchase),
                              l.estimatedCost != null ? `RM ${l.estimatedCost.toFixed(2)}` : "-",
                          ]
                        : [
                              "",
                              l.name,
                              l.packageSize,
                              l.unit,
                              String(l.totalRequested),
                              String(l.stock),
                              String(l.toPurchase),
                          ]
                ),
                theme: "grid",
                styles: { fontSize: 10 },
                headStyles: { fillColor: [40, 40, 40] },
                columnStyles: { 0: { cellWidth: 8, halign: "center" } },
                foot: hasAnyCost
                    ? [["", "", "", "", "", "", "Total", `RM ${grandTotal.toFixed(2)}`]]
                    : undefined,
                footStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: "bold" },
            });

            y = (doc as any).lastAutoTable.finalY + 12;
        }

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
                head: [["Item", "Kuantiti", "Saiz Pek", "Unit", "Sebab"]],
                body: kitchenPending.map((r) => [
                    getBaseName(r),
                    String(r.quantity),
                    getPackageSizeDisplay(r, itemInfoMap),
                    getUnitDisplay(r, itemInfoMap),
                    r.reason || "-",
                ]),
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
               <PageHeader
                    title="Permintaan Inventori"
                    action={<Button onClick={downloadPdf} variant="outline"><Download className="h-4 w-4 mr-1.5" />Download Checklist PDF</Button>}
                    />

                {/* FILTERS */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                            type="text"
                            placeholder="Search item..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-max rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:max-w-xs sm:py-1.5"
                        />

                        <select
                            value={kitchenFilter}
                            onChange={(e) => setKitchenFilter(e.target.value)}
                            className="w-max rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:w-auto sm:py-1.5"
                        >
                            <option value="all">All kitchens</option>
                            {kitchenOptions.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setStatusFilter(f.value)}
                                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:py-1 ${
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

                {!loading && groupedRequests.length === 0 && (
                    <>
                        <div className="hidden md:block">
                            <DataTable
                                columns={REQUEST_COLUMNS}
                                data={[]}
                                emptyMessage={
                                    requests.length === 0
                                        ? "Belum ada permintaan."
                                        : "Tiada permintaan yang sepadan dengan penapis ini."
                                }
                                renderRow={() => null}
                            />
                        </div>
                        <p className="text-center text-sm text-gray-500 md:hidden">
                            {requests.length === 0
                                ? "Belum ada permintaan."
                                : "Tiada permintaan yang sepadan dengan penapis ini."}
                        </p>
                    </>
                )}

                {groupedRequests.map((group) => (
                    <div key={group.kitchen_name} className="space-y-3">
                        <h2 className="text-lg font-semibold">{group.kitchen_name}</h2>

                        <div className="hidden md:block">
                            <DataTable
                                columns={REQUEST_COLUMNS}
                                data={group.requests}
                                loading={loading}
                                emptyMessage="Tiada permintaan."
                                renderRow={(req, index) => (
                                    <TableRow key={req.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{getItemLabel(req)}</TableCell>
                                    <TableCell>{req.quantity}</TableCell>
                                    <TableCell className="text-gray-600">{req.reason}</TableCell>
                                    <TableCell><StockCheckBadge check={getStockCheck(req)} /></TableCell>
                                    <TableCell><Badge className={getBadgeStyle(req.status)}>{req.status.toUpperCase()}</Badge></TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex gap-2 justify-center flex-wrap">
                                        <RequestActions req={req} onApprove={approve} onFulfill={fulfillFromStock} onReject={reject} />
                                        </div>
                                    </TableCell>
                                    </TableRow>
                                )}
                                />
                        </div>

                        {/* MOBILE CARDS */}
                        <div className="grid grid-cols-1 gap-3 md:hidden">
                            {group.requests.map((req) => (
                                <Card key={req.id} className="overflow-hidden">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-semibold leading-snug truncate">
                                                    {getBaseName(req)}
                                                </p>
                                                {req.reason && (
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                        {req.reason}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge className={`${getBadgeStyle(req.status)} shrink-0`}>
                                                {req.status.toUpperCase()}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 rounded-md bg-gray-50 p-2.5 text-center">
                                            <div>
                                                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                                    Kuantiti
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {req.quantity}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                                    Saiz Pek
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {getPackageSizeDisplay(req, itemInfoMap)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                                    Unit
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {getUnitDisplay(req, itemInfoMap)}
                                                </p>
                                            </div>
                                        </div>

                                        <StockCheckBadge check={getStockCheck(req)} />

                                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                                            <MobileRequestActions
                                                req={req}
                                                onApprove={approve}
                                                onFulfill={fulfillFromStock}
                                                onReject={reject}
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