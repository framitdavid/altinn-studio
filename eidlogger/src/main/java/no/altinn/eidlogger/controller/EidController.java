package no.altinn.eidlogger.controller;

import no.altinn.eidlogger.dto.EidLogResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EidController {

  @PostMapping("/eid-event-log")
  public EidLogResponse getEid() {
    return new EidLogResponse();
  }
}
