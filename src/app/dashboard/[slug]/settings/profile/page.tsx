"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSession } from "@/lib/auth-client";
import {
  deleteOrganization,
  getOrganizations,
  updateOrganization,
  type Organization,
} from "@/lib/api/organizations";
import { useOrgStore } from "@/lib/stores/org-store";
import {
  Loader2,
  Pencil,
  Trash2,
  Plus,
  Camera,
  AlertTriangle,
  ShieldX,
  Clock,
  LogOut,
} from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { terminateAccount, cancelTermination, deleteAccount } from "@/lib/api/payments";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/config";
import { DashboardSettingsNav } from "@/components/settings/dashboard-settings-nav";

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const email = session?.user?.email ?? "";
  const userName = session?.user?.name || email.split("@")[0] || "User";
  const userImage = (session?.user as Record<string, unknown>)?.image as string | undefined;
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const { setOrganizations } = useOrgStore();

  const [organizations, setLocalOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Terminate / Delete state
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [terminateStep, setTerminateStep] = useState<"idle" | "done">("idle");
  const [terminating, setTerminating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0); // 0=closed, 1=are you sure, 2=type confirm
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteOrgId, setDeleteOrgId] = useState<number | null>(null);
  const [deleteOrgName, setDeleteOrgName] = useState("");
  const [deleteOrgConfirmText, setDeleteOrgConfirmText] = useState("");
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadOrgs = useCallback(async () => {
    if (!email) return;
    try {
      setLoading(true);
      const data = await getOrganizations(email);
      setLocalOrgs(data);
      setOrganizations(data);
    } catch {
      setError("Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  }, [email, setOrganizations]);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  async function handleSave(id: number) {
    if (!editName.trim()) return;
    setSavingId(id);
    setError(null);
    setNotice(null);
    try {
      const updated = await updateOrganization(id, { name: editName.trim(), url: editUrl.trim() });
      const next = organizations.map((o) => (o.id === id ? updated : o));
      setLocalOrgs(next);
      setOrganizations(next);
      setEditingId(null);
      setNotice("Project updated.");
    } catch {
      setError("Failed to update.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    setError(null);
    setNotice(null);
    try {
      await deleteOrganization(id);
      const next = organizations.filter((o) => o.id !== id);
      setLocalOrgs(next);
      setOrganizations(next);
      if (editingId === id) setEditingId(null);
      setNotice("Project deleted.");
    } catch {
      setError("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleTerminate() {
    if (!email) return;
    setTerminating(true);
    setError(null);
    try {
      await terminateAccount(email);
      setTerminateStep("done");
      setShowTerminateDialog(false);
      setNotice("Account scheduled for deactivation in 24 hours.");
    } catch {
      setError("Failed to terminate account.");
    } finally {
      setTerminating(false);
    }
  }

  async function handleCancelTermination() {
    if (!email) return;
    setCancelling(true);
    setError(null);
    try {
      await cancelTermination(email);
      setTerminateStep("idle");
      setNotice("Termination cancelled. Your account is active.");
    } catch {
      setError("Failed to cancel termination.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleDeleteAccount() {
    if (!email || deleteConfirmText !== "delete my account") return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount(email, deleteConfirmText);
    } catch {
      setError("Failed to delete account. Make sure the backend is running and try again.");
      setDeleting(false);
      return;
    }
    // Account data deleted — sign out (best-effort, never blocks the redirect)
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push(routes.signIn);
  }

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOut();
    } catch {
      // ignore sign-out error — redirect anyway
    } finally {
      setSigningOut(false);
    }
    router.push(routes.signIn);
  }

  return (
    <div className="space-y-6">
      <DashboardSettingsNav label="Profile" />

      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Profile</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Manage your account and organizations.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-[13px] font-medium text-primary">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] font-medium text-emerald-700">
          {notice}
        </div>
      )}

      {/* ── Two-column main grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — Account */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="rounded-lg border border-border bg-white shadow-sm">
            {/* Avatar area */}
            <div className="flex flex-col items-center px-6 pb-5 pt-8 text-center">
              <div className="group relative mb-4">
                <UserAvatar src={userImage} initials={userInitials} size={80} />
                <div className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-5 w-5 text-white" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-[15px] font-semibold tracking-tight text-neutral-900">
                {userName}
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{email}</p>
              {userImage && (
                <span className="mt-2 inline-block rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[10px] text-muted-foreground">
                  Photo from Google
                </span>
              )}
            </div>

            {/* Sign out */}
            <div className="border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-[13px] font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>

        {/* Right column — Projects */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-white shadow-sm">
            <div className="flex items-start justify-between border-b border-border px-6 py-4">
              <div>
                <p className="text-[14px] font-semibold tracking-tight text-neutral-900">
                  Projects
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Add, edit, or remove your tracked projects.
                </p>
              </div>
              <button
                onClick={() => router.push("/onboarding/company-info")}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Add Project
              </button>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border border-border bg-neutral-50/60 px-4 py-3"
                    >
                      <div className="space-y-1.5">
                        <Skeleton className="h-[13px] w-36 rounded" />
                        <Skeleton className="h-[11px] w-48 rounded" />
                      </div>
                      <div className="flex gap-1.5">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : organizations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                    <Plus className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <p className="text-[13px] font-medium text-neutral-700">No projects yet</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Add your first project to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {organizations.map((org) => {
                    const isEditing = editingId === org.id;
                    return (
                      <div
                        key={org.id}
                        className="rounded-md border border-border bg-neutral-50/60 px-4 py-3 transition-colors hover:bg-neutral-50"
                      >
                        {isEditing ? (
                          <div className="flex flex-wrap gap-2">
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Project name"
                              className="min-w-0 flex-1 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <input
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              placeholder="https://example.com"
                              className="min-w-0 flex-1 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                              onClick={() => handleSave(org.id)}
                              disabled={savingId === org.id}
                              className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
                            >
                              {savingId === org.id ? "Saving…" : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[14px] font-semibold tracking-tight text-neutral-900">
                                {org.name}
                              </p>
                              <p className="truncate text-[12px] text-muted-foreground">
                                {org.url || "No URL set"}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingId(org.id);
                                  setEditName(org.name);
                                  setEditUrl(org.url ?? "");
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteOrgId(org.id);
                                  setDeleteOrgName(org.name);
                                  setDeleteOrgConfirmText("");
                                }}
                                disabled={deletingId === org.id}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/25 bg-white text-primary shadow-sm transition hover:bg-primary/5 disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="rounded-lg border border-red-200 bg-red-50/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" strokeWidth={1.75} />
          <p className="text-[13px] font-semibold text-red-600">Danger Zone</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Pause Account */}
          <div className="flex flex-col justify-between gap-4 rounded-md border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-500">
                <Clock className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-neutral-900">Pause Account</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  Temporarily pause your account. Scheduled analyses will be disabled. You can
                  resume anytime.
                </p>
              </div>
            </div>
            {terminateStep === "idle" ? (
              <button
                onClick={() => setShowTerminateDialog(true)}
                className="w-full rounded-md border border-amber-400/40 bg-amber-50 px-4 py-1.5 text-[12px] font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                Pause Account
              </button>
            ) : (
              <button
                onClick={handleCancelTermination}
                disabled={cancelling}
                className="w-full rounded-md border border-emerald-400/40 bg-emerald-50 px-4 py-1.5 text-[12px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
              >
                {cancelling ? "Resuming…" : "Resume Account"}
              </button>
            )}
          </div>

          {/* Delete Account */}
          <div className="flex flex-col justify-between gap-4 rounded-md border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-500">
                <ShieldX className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-neutral-900">Delete Account</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be
                  undone.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDeleteStep(1)}
              className="w-full rounded-md bg-red-500 px-4 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-red-600"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Organization Dialog */}
      {deleteOrgId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-sm border border-black/8 bg-white p-6 text-center shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-black/8 bg-white text-red-500 shadow-sm">
              <Trash2 className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h3 className="mb-2 text-[16px] font-semibold tracking-tight text-neutral-900">
              Delete project
            </h3>
            <p className="mb-4 text-left text-[13px] font-light leading-relaxed text-accent-foreground">
              This will remove all analysis runs and data for this project. Type the project name{" "}
              <strong className="font-semibold text-neutral-900">
                &ldquo;{deleteOrgName}&rdquo;
              </strong>{" "}
              to confirm.
            </p>
            <label className="mb-1.5 block text-left text-[11px] font-semibold tracking-tight text-accent-foreground">
              Project name
            </label>
            <input
              type="text"
              value={deleteOrgConfirmText}
              onChange={(e) => setDeleteOrgConfirmText(e.target.value)}
              autoComplete="off"
              placeholder={deleteOrgName}
              className="mb-4 w-full rounded-sm border border-black/8 bg-white px-3 py-2.5 text-[13px] text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (deleteOrgId === null || deleteOrgConfirmText.trim() !== deleteOrgName.trim())
                    return;
                  handleDelete(deleteOrgId);
                  setDeleteOrgId(null);
                  setDeleteOrgName("");
                  setDeleteOrgConfirmText("");
                }}
                disabled={
                  deletingId === deleteOrgId || deleteOrgConfirmText.trim() !== deleteOrgName.trim()
                }
                className="flex-1 rounded-sm bg-red-500 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-red-600 disabled:opacity-50"
              >
                {deletingId === deleteOrgId ? "Deleting..." : "Delete project"}
              </button>
              <button
                onClick={() => {
                  setDeleteOrgId(null);
                  setDeleteOrgName("");
                  setDeleteOrgConfirmText("");
                }}
                className="flex-1 rounded-sm border border-black/8 bg-white py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Account Dialog */}
      {showTerminateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-sm border border-black/8 bg-white p-6 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-black/8 bg-white text-amber-500 shadow-sm">
                <Clock className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight text-neutral-900">
                  Pause Account
                </h3>
                <p className="text-[12px] font-light leading-snug text-accent-foreground">
                  Temporarily pause your account
                </p>
              </div>
            </div>

            <div className="mb-5 rounded-sm border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-[12px] font-light leading-relaxed text-amber-600 dark:text-amber-400">
                Your account will be paused. You can{" "}
                <span className="font-semibold">resume anytime</span> from this settings page. While
                paused, scheduled analyses and integrations will be disabled.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleTerminate}
                disabled={terminating}
                className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-amber-500 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
              >
                {terminating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4" strokeWidth={1.75} />
                )}
                {terminating ? "Pausing..." : "Pause Account"}
              </button>
              <button
                onClick={() => setShowTerminateDialog(false)}
                className="rounded-sm border border-black/8 bg-white px-5 py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog, Step 1: Are you sure? */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-sm border border-black/8 bg-white p-6 text-center shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-black/8 bg-white text-red-500 shadow-sm">
              <ShieldX className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h3 className="mb-2 text-[16px] font-semibold tracking-tight text-neutral-900">
              Are you sure?
            </h3>
            <p className="mb-6 text-[13px] font-light leading-relaxed text-accent-foreground">
              You&apos;re about to delete your account. This will remove all your data permanently.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteStep(2)}
                className="flex-1 rounded-sm bg-red-500 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-red-600"
              >
                Yes, continue
              </button>
              <button
                onClick={() => setDeleteStep(0)}
                className="flex-1 rounded-sm border border-black/8 bg-white py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                No, go back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog, Step 2: Type to confirm */}
      {deleteStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-sm border border-black/8 bg-white p-6 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-black/8 bg-white text-red-500 shadow-sm">
                <ShieldX className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight text-neutral-900">
                  Delete Account Permanently
                </h3>
                <p className="text-[12px] font-light leading-snug text-accent-foreground">
                  This action is irreversible
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-sm border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-[12px] font-light leading-relaxed text-red-500">
                This will permanently delete your account, all analysis runs, organizations,
                subscription data, and everything associated with{" "}
                <span className="font-semibold">{email}</span>. This cannot be undone.
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold tracking-tight text-accent-foreground">
                Type{" "}
                <span className="font-mono font-semibold text-neutral-900">delete my account</span>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete my account"
                autoFocus
                className="w-full rounded-sm border border-black/8 bg-white px-3 py-2.5 font-mono text-[13px] text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== "delete my account"}
                className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-red-500 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                )}
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
              <button
                onClick={() => {
                  setDeleteStep(0);
                  setDeleteConfirmText("");
                }}
                className="rounded-sm border border-black/8 bg-white px-5 py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
