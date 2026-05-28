"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
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
  AlertTriangle,
  ShieldX,
  Clock,
  LogOut,
} from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { terminateAccount, cancelTermination, deleteAccount } from "@/lib/api/payments";
import {
  deleteProfilePhoto,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  type ProfileData,
} from "@/lib/api/profile";
import { signOut } from "@/lib/auth-client";
import { routes } from "@/lib/config";
import { DashboardSettingsNav } from "@/components/settings/dashboard-settings-nav";
import { cn } from "@/lib/utils";

/** Renders children into document.body so modals escape ancestor transforms (which
 * otherwise become the containing block for position: fixed). */
function ModalPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

/** Two-column form row: label + helper on the left, input(s) on the right. */
function FieldRow({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 py-5 md:grid-cols-[280px_1fr] md:gap-10">
      <div>
        <p className="text-[14px] font-semibold tracking-tight text-neutral-900">{label}</p>
        {helper ? (
          <p className="mt-1 text-[12px] font-light leading-relaxed text-neutral-500">{helper}</p>
        ) : null}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SectionDivider() {
  return <div className="border-t border-black/8" />;
}

const INPUT_CLS =
  "w-full rounded-md border border-black/10 bg-white px-3 py-2 text-[13px] text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200";

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-[12px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50";

const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-black/12 bg-white px-4 py-2 text-[12px] font-semibold tracking-tight text-neutral-900 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50";

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const email = session?.user?.email ?? "";
  const sessionImage = (session?.user as Record<string, unknown>)?.image as string | undefined;
  const { setOrganizations } = useOrgStore();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [organizations, setLocalOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [terminateStep, setTerminateStep] = useState<"idle" | "done">("idle");
  const [terminating, setTerminating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
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

  // Derived display name + initials. Uses the editable fields once loaded
  // so the avatar fallback stays in sync as the user types.
  const userName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    session?.user?.name ||
    email.split("@")[0] ||
    "User";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  // B2 photo > Google OAuth photo. We never show a stale upload — once the
  // user removes it, `photo_url` is null and we fall back to Google again.
  const photoSrc = profile?.photo_url || sessionImage || undefined;

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

  const loadProfile = useCallback(async () => {
    if (!email) return;
    try {
      setProfileLoading(true);
      const data = await getProfile(email);
      setProfile(data);
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setPhone(data.phone_number);
    } catch {
      // Non-fatal — empty form is still usable.
    } finally {
      setProfileLoading(false);
    }
  }, [email]);

  useEffect(() => {
    loadOrgs();
    loadProfile();
  }, [loadOrgs, loadProfile]);

  async function handleSaveProfile() {
    if (!email) return;
    setSavingProfile(true);
    setError(null);
    setNotice(null);
    try {
      await updateProfile(email, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim(),
      });
      setNotice("Profile updated.");
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePhotoFile(file: File) {
    if (!email) return;
    setUploadingPhoto(true);
    setError(null);
    setNotice(null);
    try {
      const { photo_url } = await uploadProfilePhoto(email, file);
      setProfile((p) => (p ? { ...p, photo_url } : p));
      setNotice("Photo updated.");
    } catch (e: unknown) {
      const detail =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Photo upload failed.";
      setError(detail);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemovePhoto() {
    if (!email) return;
    setRemovingPhoto(true);
    setError(null);
    setNotice(null);
    try {
      const { photo_url } = await deleteProfilePhoto(email);
      setProfile((p) => (p ? { ...p, photo_url } : p));
      setNotice("Photo removed.");
    } catch {
      setError("Could not remove photo.");
    } finally {
      setRemovingPhoto(false);
    }
  }

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
      // ignore
    } finally {
      setSigningOut(false);
    }
    router.push(routes.signIn);
  }

  const profileDirty =
    profile !== null &&
    (firstName.trim() !== profile.first_name ||
      lastName.trim() !== profile.last_name ||
      phone.trim() !== profile.phone_number);

  return (
    <div className="px-2 py-2 font-sans">
      <DashboardSettingsNav label="Profile" />

      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Profile</h2>
        <p className="mt-1 text-[13px] font-light leading-relaxed text-neutral-500">
          Manage your account details, photo, and organizations.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">
          {notice}
        </div>
      ) : null}

      {/* ── Personal Information ──────────────────────────────────────── */}
      <div className="rounded-lg border border-black/8 bg-white shadow-sm">
        <div className="border-b border-black/8 px-6 py-4">
          <p className="text-[13px] font-semibold tracking-tight text-neutral-900">
            Personal Information
          </p>
        </div>

        <div className="divide-y divide-black/8 px-6">
          <FieldRow label="Profile photo" helper="Recommend size 1:1, up to 2MB.">
            <div className="flex items-center gap-4">
              <UserAvatar src={photoSrc} initials={userInitials} size={64} />
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePhotoFile(f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className={BTN_PRIMARY}
                >
                  {uploadingPhoto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  {uploadingPhoto ? "Uploading…" : "Upload picture"}
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={removingPhoto || !profile?.photo_url}
                  className={BTN_OUTLINE}
                >
                  {removingPhoto ? "Removing…" : "Remove"}
                </button>
              </div>
            </div>
          </FieldRow>

          <FieldRow label="Name" helper="Shown across Signalor wherever your account appears.">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-neutral-500">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={INPUT_CLS}
                  disabled={profileLoading}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-neutral-500">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={INPUT_CLS}
                  disabled={profileLoading}
                />
              </div>
            </div>
          </FieldRow>

          <FieldRow
            label="Email address"
            helper="The address you signed in with. Used for billing receipts and notifications."
          >
            <input
              type="email"
              value={email}
              readOnly
              className={cn(INPUT_CLS, "bg-neutral-50 text-neutral-500")}
            />
            <p className="text-[11px] text-neutral-500">
              Email changes aren&rsquo;t available yet. Contact support if you need to migrate.
            </p>
          </FieldRow>

          <FieldRow
            label="Phone number"
            helper="Optional — used only for account recovery and high-priority alerts."
          >
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={INPUT_CLS}
              placeholder="+1 555 000 0000"
              disabled={profileLoading}
            />
          </FieldRow>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-black/8 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              if (!profile) return;
              setFirstName(profile.first_name);
              setLastName(profile.last_name);
              setPhone(profile.phone_number);
            }}
            disabled={!profileDirty || savingProfile}
            className={BTN_OUTLINE}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={!profileDirty || savingProfile}
            className={BTN_PRIMARY}
          >
            {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* ── Projects ──────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-lg border border-black/8 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-black/8 px-6 py-4">
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-neutral-900">Projects</p>
            <p className="mt-0.5 text-[12px] font-light text-neutral-500">
              Add, edit, or remove your projects.
            </p>
          </div>
          <button onClick={() => router.push("/onboarding/company-info")} className={BTN_PRIMARY}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add project
          </button>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-black/8 bg-neutral-50 px-4 py-3"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-[14px] w-32 rounded" />
                    <Skeleton className="h-[12px] w-44 rounded" />
                  </div>
                  <div className="flex gap-1.5">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : organizations.length === 0 ? (
            <p className="py-6 text-center text-[12px] font-light text-neutral-500">
              No projects yet.
            </p>
          ) : (
            <div className="space-y-2">
              {organizations.map((org) => {
                const isEditing = editingId === org.id;
                return (
                  <div
                    key={org.id}
                    className="rounded-md border border-black/8 bg-neutral-50/60 px-4 py-3"
                  >
                    {isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={cn(INPUT_CLS, "flex-1 min-w-[160px]")}
                        />
                        <input
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className={cn(INPUT_CLS, "flex-1 min-w-[200px]")}
                        />
                        <button
                          onClick={() => handleSave(org.id)}
                          disabled={savingId === org.id}
                          className={BTN_PRIMARY}
                        >
                          {savingId === org.id ? "…" : "Save"}
                        </button>
                        <button onClick={() => setEditingId(null)} className={BTN_OUTLINE}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[14px] font-semibold tracking-tight text-neutral-900">
                            {org.name}
                          </p>
                          <p className="text-[12px] font-light text-neutral-500">
                            {org.url || "No URL"}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setEditingId(org.id);
                              setEditName(org.name);
                              setEditUrl(org.url ?? "");
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-black/10 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-50"
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
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-300 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-50"
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

      {/* ── Danger Zone ──────────────────────────────────────────────── */}
      <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50/40 shadow-sm">
        <div className="flex items-center gap-2 border-b border-rose-200 px-6 py-4">
          <AlertTriangle className="h-4 w-4 text-rose-600" strokeWidth={1.75} />
          <p className="text-[13px] font-semibold tracking-tight text-rose-600">Danger zone</p>
        </div>

        <div className="space-y-2 px-6 py-4">
          <div className="flex items-center justify-between rounded-md border border-black/8 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-black/8 bg-white text-amber-500 shadow-sm">
                <Clock className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[14px] font-semibold tracking-tight text-neutral-900">
                  Pause account
                </p>
                <p className="text-[11px] font-light text-neutral-500">
                  Temporarily pause your account. You can resume any time.
                </p>
              </div>
            </div>
            {terminateStep === "idle" ? (
              <button
                onClick={() => setShowTerminateDialog(true)}
                className="rounded-md border border-amber-500/40 bg-white px-4 py-2 text-[12px] font-semibold tracking-tight text-amber-700 shadow-sm transition hover:bg-amber-50"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={handleCancelTermination}
                disabled={cancelling}
                className="rounded-md border border-emerald-500/40 bg-white px-4 py-2 text-[12px] font-semibold tracking-tight text-emerald-700 shadow-sm transition hover:bg-emerald-50 disabled:opacity-50"
              >
                {cancelling ? "Resuming…" : "Resume account"}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md border border-black/8 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-black/8 bg-white text-rose-600 shadow-sm">
                <ShieldX className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[14px] font-semibold tracking-tight text-neutral-900">
                  Delete account
                </p>
                <p className="text-[11px] font-light text-neutral-500">
                  Permanently delete all data. This cannot be undone.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDeleteStep(1)}
              className="rounded-md bg-rose-600 px-4 py-2 text-[12px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-rose-700"
            >
              Delete account
            </button>
          </div>

          <div className="flex items-center justify-between rounded-md border border-black/8 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-black/8 bg-white text-neutral-700 shadow-sm">
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[14px] font-semibold tracking-tight text-neutral-900">
                  Sign out
                </p>
                <p className="text-[11px] font-light text-neutral-500">
                  End your session on this device.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className={BTN_OUTLINE}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal dialogs (unchanged behavior) ───────────────────────── */}
      {deleteOrgId !== null && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm rounded-lg border border-black/8 bg-white p-6 text-center shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-black/8 bg-white text-rose-600 shadow-sm">
                <Trash2 className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 text-[16px] font-semibold tracking-tight text-neutral-900">
                Delete project
              </h3>
              <p className="mb-4 text-left text-[13px] font-light leading-relaxed text-neutral-600">
                This will remove all analysis runs and data for this project. Type the project name{" "}
                <strong className="font-semibold text-neutral-900">
                  &ldquo;{deleteOrgName}&rdquo;
                </strong>{" "}
                to confirm.
              </p>
              <label className="mb-1.5 block text-left text-[11px] font-semibold tracking-tight text-neutral-600">
                Project name
              </label>
              <input
                type="text"
                value={deleteOrgConfirmText}
                onChange={(e) => setDeleteOrgConfirmText(e.target.value)}
                autoComplete="off"
                placeholder={deleteOrgName}
                className={cn(INPUT_CLS, "mb-4")}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (
                      deleteOrgId === null ||
                      deleteOrgConfirmText.trim() !== deleteOrgName.trim()
                    )
                      return;
                    handleDelete(deleteOrgId);
                    setDeleteOrgId(null);
                    setDeleteOrgName("");
                    setDeleteOrgConfirmText("");
                  }}
                  disabled={
                    deletingId === deleteOrgId ||
                    deleteOrgConfirmText.trim() !== deleteOrgName.trim()
                  }
                  className="flex-1 rounded-md bg-rose-600 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {deletingId === deleteOrgId ? "Deleting…" : "Delete project"}
                </button>
                <button
                  onClick={() => {
                    setDeleteOrgId(null);
                    setDeleteOrgName("");
                    setDeleteOrgConfirmText("");
                  }}
                  className="flex-1 rounded-md border border-black/8 bg-white py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {showTerminateDialog && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-lg border border-black/8 bg-white p-6 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-black/8 bg-white text-amber-500 shadow-sm">
                  <Clock className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold tracking-tight text-neutral-900">
                    Pause account
                  </h3>
                  <p className="text-[12px] font-light text-neutral-500">
                    Temporarily pause your account
                  </p>
                </div>
              </div>

              <div className="mb-5 rounded-md border border-amber-500/20 bg-amber-50 p-4">
                <p className="text-[12px] font-light leading-relaxed text-amber-700">
                  Your account will be paused. You can{" "}
                  <span className="font-semibold">resume anytime</span> from this settings page.
                  While paused, scheduled analyses and integrations will be disabled.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleTerminate}
                  disabled={terminating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {terminating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4" strokeWidth={1.75} />
                  )}
                  {terminating ? "Pausing…" : "Pause account"}
                </button>
                <button
                  onClick={() => setShowTerminateDialog(false)}
                  className="rounded-md border border-black/8 bg-white px-5 py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {deleteStep === 1 && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm rounded-lg border border-black/8 bg-white p-6 text-center shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-black/8 bg-white text-rose-600 shadow-sm">
                <ShieldX className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 text-[16px] font-semibold tracking-tight text-neutral-900">
                Are you sure?
              </h3>
              <p className="mb-6 text-[13px] font-light leading-relaxed text-neutral-600">
                You&apos;re about to delete your account. This will remove all your data
                permanently.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteStep(2)}
                  className="flex-1 rounded-md bg-rose-600 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-rose-700"
                >
                  Yes, continue
                </button>
                <button
                  onClick={() => setDeleteStep(0)}
                  className="flex-1 rounded-md border border-black/8 bg-white py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                >
                  No, go back
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {deleteStep === 2 && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-lg border border-black/8 bg-white p-6 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-black/8 bg-white text-rose-600 shadow-sm">
                  <ShieldX className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold tracking-tight text-neutral-900">
                    Delete account permanently
                  </h3>
                  <p className="text-[12px] font-light text-neutral-500">
                    This action is irreversible
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3">
                <p className="text-[12px] font-light leading-relaxed text-rose-700">
                  This will permanently delete your account, all analysis runs, organizations,
                  subscription data, and everything associated with{" "}
                  <span className="font-semibold">{email}</span>. This cannot be undone.
                </p>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-[11px] font-semibold tracking-tight text-neutral-600">
                  Type{" "}
                  <span className="font-mono font-semibold text-neutral-900">
                    delete my account
                  </span>{" "}
                  to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="delete my account"
                  autoFocus
                  className={cn(INPUT_CLS, "font-mono")}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText !== "delete my account"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-rose-600 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  )}
                  {deleting ? "Deleting…" : "Delete forever"}
                </button>
                <button
                  onClick={() => {
                    setDeleteStep(0);
                    setDeleteConfirmText("");
                  }}
                  className="rounded-md border border-black/8 bg-white px-5 py-2.5 text-[13px] font-semibold tracking-tight text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
