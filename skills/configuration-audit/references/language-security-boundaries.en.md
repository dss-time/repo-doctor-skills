# Language-aware security and execution boundaries

## Select the applicable profile
Identify source language, runtime, build configuration, deployment context and native dependencies from repository evidence. Select per component in mixed repositories; file extensions alone are insufficient. Record unknowns. Apply only relevant checks, proportional to the requested change; do not run every language checklist or install toolchains automatically.

| Component | Relevant checks and conditional validation |
| --- | --- |
| JavaScript / TypeScript | Server-side authorization, injection, prototype pollution, path containment, async races, runtime validation despite static types. No manual free, pointer ownership or C integer-overflow checklist for pure JS; inspect native addons separately. |
| Python | Parameterized queries, unsafe deserialization, command construction, path handling, authorization and concurrency. No manual memory-management checklist for pure Python. |
| Java / .NET | Object authorization, deserialization, process execution, resource disposal, concurrency and framework security configuration; native interop is a separate boundary. |
| Go | Slice bounds, error handling, goroutine races, cancellation and resource lifetime; pointer arithmetic checks only for unsafe/cgo boundaries. |
| Rust | Authorization and logic remain relevant in safe Rust. Review unsafe/FFI invariants, ownership across boundaries and concurrency where present; do not assume safe Rust proves application security. |
| C / C++ | Buffer sizes, integer conversions/overflow before allocation or copy, ownership, lifetime, use-after-free, double-free, undefined behavior and concurrency. Suggest compiler diagnostics/sanitizers only for supported, authorized environments. |
| Embedded / firmware | Add ISR, DMA, RTOS, watchdog, timing and hardware fail-safe checks only when those mechanisms exist. Never flash or actuate hardware merely to validate a review. |

Common invariants include least privilege, trusted authorization, validated input before effects, confidentiality and fail-closed behavior. The concrete evidence and tests differ by language. Missing tools or hardware mean unverified coverage, not a clean result.

## Security risk triage
For relevant changes, identify authentication, object/tenant authorization, attacker-controlled data reaching sensitive sinks, secrets, filesystem/network/process boundaries and privileged or destructive effects. Carry supported security risks into the existing coordination risk/evidence contract; absence of a keyword is not absence of risk. Routine nonsecurity work does not automatically become a full security audit. Keep explicit-only security review invocation and existing permissions unchanged.

## Runtime and component selection
Identify the relevant component before selecting checks. Browser JS requires DOM/XSS, origin and browser-storage checks when those surfaces change. Node services require server authorization, filesystem/process/network boundaries and runtime input validation. Electron requires main/renderer separation, IPC sender and payload validation, preload exposure, context isolation and native modules when present. TypeScript types do not validate external data at runtime.
For Python web frameworks, inspect the actual ORM/query APIs, template escaping, middleware and deployment configuration. For Java/.NET, select the framework/version and actual security middleware. For C/C++ identify compiler, target ABI, language standard and available libc/RTOS. For Rust distinguish safe code from unsafe/FFI. For Go separate ordinary code from unsafe/cgo. Do not infer framework protection merely from a dependency name.
Mixed repositories use a component map (path, language, runtime/framework/version evidence, trust boundary, applicable checks). Only changed components and their relevant callers/boundaries need profiles. Missing evidence remains unknown. Native memory rules apply only to native components or interop contracts. Runtime profiles guide concrete checks; they do not mandate a new toolchain or a full audit.
