import { Button, Modal } from "react-bootstrap";

export default function DetailsModal({ show, title, onClose, children }) {
  return (
    <>
      {/* Scoped styling INSIDE the component (no external App.css needed). */}
      <style>{`
        /* Backdrop (darken, but do NOT change layout) */
        .fast-hr-modal-backdrop.show {
          opacity: 0.70 !important;
        }

        /* Modal dialog sizing tweaks */
        .fast-hr-modal .modal-dialog {
          max-width: 980px;
        }

        /* Modal content: glass / orange theme */
        .fast-hr-modal .modal-content {
          border-radius: 22px !important;
          border: 2px solid rgba(255,255,255,0.18) !important;
          background: rgba(255,255,255,0.10) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #fff !important;
          box-shadow: 0 18px 40px rgba(0,0,0,0.20);
          overflow: hidden;
        }

        /* Header / Footer subtle background */
        .fast-hr-modal .modal-header,
        .fast-hr-modal .modal-footer {
          border-color: rgba(255,255,255,0.18) !important;
          background: rgba(255,255,255,0.06) !important;
        }

        .fast-hr-modal .modal-title {
          font-weight: 900 !important;
          color: #fff !important;
        }

        /* Body text */
        .fast-hr-modal .modal-body {
          color: rgba(255,255,255,0.85) !important;
        }

        /* Close X button visible on dark background */
        .fast-hr-modal .btn-close {
          filter: invert(1);
          opacity: 0.9;
        }
        .fast-hr-modal .btn-close:hover {
          opacity: 1;
        }

        /* Make selection highlight not look weird (optional) */
        .fast-hr-modal ::selection {
          background: rgba(255,255,255,0.25);
        }
      `}</style>

      <Modal
        show={show}
        onHide={onClose}
        centered
        size="lg"
        dialogClassName="fast-hr-modal"
        backdropClassName="fast-hr-modal-backdrop"
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>{children}</Modal.Body>

        <Modal.Footer>
          <Button className="hr-btn-ghost" onClick={onClose}>
            Close.
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
