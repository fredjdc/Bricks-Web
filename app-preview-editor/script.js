const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.documentElement.classList.add("js");
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

const workflowImage = document.querySelector(".workflow-media img");
const workflowSteps = document.querySelectorAll("[data-workflow-image]");

if (workflowImage && workflowSteps.length && "IntersectionObserver" in window) {
  const workflowObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      workflowSteps.forEach((step) => step.classList.toggle("is-active", step === entry.target));
      const nextSource = entry.target.dataset.workflowImage;
      if (workflowImage.getAttribute("src") !== nextSource) workflowImage.setAttribute("src", nextSource);
    });
  }, { rootMargin: "-35% 0px -45%", threshold: 0 });

  workflowSteps.forEach((step) => workflowObserver.observe(step));
  workflowSteps[0].classList.add("is-active");
}

document.querySelectorAll("[data-signup-form]").forEach((form) => {
  const frame = document.querySelector(`iframe[name="${form.target}"]`);
  const button = form.querySelector("button[type='submit']");
  const buttonLabel = button.querySelector("span");
  const status = form.querySelector(".form-status");
  let submitting = false;
  let timeout;

  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    submitting = true;
    button.disabled = true;
    buttonLabel.textContent = "Sending…";
    status.textContent = "Submitting your request…";
    status.dataset.state = "";

    timeout = window.setTimeout(() => {
      if (!submitting) return;
      submitting = false;
      button.disabled = false;
      buttonLabel.textContent = "Try again";
      status.textContent = "We couldn’t confirm the submission. Check your connection and try again.";
      status.dataset.state = "error";
    }, 15000);
  });

  frame.addEventListener("load", () => {
    if (!submitting) return;
    window.clearTimeout(timeout);
    submitting = false;
    form.reset();
    button.disabled = false;
    buttonLabel.textContent = "Continue";
    status.textContent = "Thanks. Your request has been received.";
    status.dataset.state = "success";
  });
});
