import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      className="toaster group"
      icons={{
        success: (
          <span className="material-symbols-outlined text-emerald-400 text-[22px] select-none">
            check_circle
          </span>
        ),
        info: (
          <span className="material-symbols-outlined text-blue-400 text-[22px] select-none">
            info
          </span>
        ),
        warning: (
          <span className="material-symbols-outlined text-amber-400 text-[22px] select-none">
            warning
          </span>
        ),
        error: (
          <span className="material-symbols-outlined text-red-400 text-[22px] select-none">
            cancel
          </span>
        ),
        loading: (
          <span className="material-symbols-outlined text-slate-400 text-[22px] animate-spin select-none">
            progress_activity
          </span>
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "group-[.toaster]:bg-slate-950/75 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:rounded-xl group-[.toaster]:shadow-2xl group-[.toaster]:p-4 group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:text-white",
          description: "group-[.toast]:text-xs group-[.toast]:text-slate-400",
          actionButton: "group-[.toast]:bg-white group-[.toast]:text-slate-950 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:rounded-lg",
          cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:rounded-lg",
        },
      }}
      {...props}
    />
  );
}

export { Toaster }