"use client";

import { Component, type ReactNode } from "react";

/** WebGL context үүсгэж чадаагүй гэх мэт 3D алдааг барьж, 3D-гүй хувилбар руу шилжүүлнэ (onError) */
export class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
