import React from "react";
import { createRoot } from "react-dom/client";
import ProfilePopup from "../components/ProfilePopup";

/*
  Usage example:

    import openProfilePopup from '../hooks/useProfilePopup';

    // inside a click handler
    onClick={(e) => openProfilePopup(user._id, e.currentTarget)}

  This helper mounts the ProfilePopup into a portal and returns a close function.
*/

let rootMap = new Map();

function createContainer() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

export function openProfilePopup(userId, anchorElement = null, options = {}) {
  // create a unique container for each popup instance
  const key = `${userId}-${Date.now()}`;
  const container = createContainer();
  const root = createRoot(container);

  const close = () => {
    try {
      root.unmount();
    } catch (e) {}
    if (container.parentNode) container.parentNode.removeChild(container);
    rootMap.delete(key);
  };

  root.render(
    <ProfilePopup
      userId={userId}
      anchorElement={anchorElement}
      onClose={close}
      context={options.context || "default"}
    />
  );

  rootMap.set(key, { root, container });
  return () => close();
}

export default openProfilePopup;
