module microlink_top #(
    parameter int PAYLOAD_W = 64
) (
    input logic clk_i,
    input logic rst_ni,
    input logic start_i,
    input logic [63:0] sequence_i,
    input logic [7:0] message_type_i,
    input logic [2:0] priority_i,
    input logic [PAYLOAD_W-1:0] payload_i,
    input logic [255:0] auth_tag_i,
    output logic busy_o,
    output logic rx_frame_start_o,
    output logic rx_payload_valid_o,
    output logic [7:0] rx_payload_data_o,
    output logic rx_framing_error_o
);
    logic tx_valid;
    logic [7:0] tx_data;
    logic tx_ready;

    microlink_tx #(.PAYLOAD_W(PAYLOAD_W)) u_tx (
        .clk_i,
        .rst_ni,
        .start_i,
        .sequence_i,
        .message_type_i,
        .priority_i,
        .payload_i,
        .auth_tag_i,
        .valid_o(tx_valid),
        .frame_data_o(tx_data),
        .ready_i(tx_ready),
        .busy_o
    );

    microlink_rx u_rx (
        .clk_i,
        .rst_ni,
        .valid_i(tx_valid),
        .data_i(tx_data),
        .ready_o(tx_ready),
        .frame_start_o(rx_frame_start_o),
        .payload_valid_o(rx_payload_valid_o),
        .payload_data_o(rx_payload_data_o),
        .framing_error_o(rx_framing_error_o)
    );
endmodule
